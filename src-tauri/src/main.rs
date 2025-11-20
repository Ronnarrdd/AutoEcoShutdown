// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use sysinfo::System;
use chrono::{Local, Timelike};
use std::process::Command;
use tauri::Manager;

#[derive(Clone, Serialize, Deserialize)]
struct EcoData {
    current_watts: u32,
    cpu_usage: u32,
    memory_usage: u32,
    battery_level: u32,
    is_charging: bool,
    session_duration_minutes: u32,
    energy_wasted_wh: u32,
    hours_until_morning: f32,
    co2_wasted_kg: f32,
    trees_equivalent: f32,
    car_km_equivalent: f32,
    nightly_waste: u32,
}

struct AppState {
    session_start_time: std::time::Instant,
    total_saved_energy: f32,
}

// Fonctions de calcul écologique
fn calculate_co2_saved(energy_saved_wh: f32) -> f32 {
    // 1 kWh = environ 0.5 kg CO2 en France (mix énergétique français)
    (energy_saved_wh / 1000.0) * 0.5
}

fn calculate_trees_equivalent(co2_saved_kg: f32) -> f32 {
    // Un arbre absorbe environ 22 kg de CO2 par an
    co2_saved_kg / 22.0
}

fn calculate_car_km_equivalent(co2_saved_kg: f32) -> f32 {
    // Une voiture émet environ 0.12 kg CO2 par km
    co2_saved_kg / 0.12
}

fn get_real_power_consumption(sys: &mut System) -> (u32, u32, u32) {
    sys.refresh_cpu();
    sys.refresh_memory();
    
    // Attendre un peu pour avoir des données CPU précises
    std::thread::sleep(std::time::Duration::from_millis(200));
    sys.refresh_cpu();
    
    // Calcul de l'utilisation CPU moyenne
    let cpu_usage = sys.global_cpu_info().cpu_usage();
    
    // Calcul de l'utilisation mémoire
    let memory_usage = ((sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0) as u32;
    
    // Estimation de consommation basée sur l'utilisation
    let base_power = 45; // Consommation de base en watts
    let cpu_power = ((cpu_usage / 100.0) * 65.0) as u32; // Max 65W pour CPU
    let memory_power = ((memory_usage as f32 / 100.0) * 15.0) as u32; // Max 15W pour RAM
    
    let total_watts = base_power + cpu_power + memory_power;
    
    (total_watts, cpu_usage as u32, memory_usage)
}

#[tauri::command]
async fn get_eco_data(state: tauri::State<'_, Arc<Mutex<AppState>>>) -> Result<EcoData, String> {
    let mut sys = System::new_all();
    
    let (current_watts, cpu_usage, memory_usage) = get_real_power_consumption(&mut sys);
    
    let state_lock = state.lock().map_err(|e| e.to_string())?;
    let session_duration_hours = state_lock.session_start_time.elapsed().as_secs_f32() / 3600.0;
    drop(state_lock);
    
    // Calculer l'énergie qui serait gaspillée pendant une nuit complète (8 heures)
    let night_duration_hours = 8.0;
    let energy_wasted_if_left_on = night_duration_hours * current_watts as f32;
    
    // Calculer jusqu'au matin (8h00 du matin)
    let now = Local::now();
    let mut tomorrow_8am = Local::now()
        .date_naive()
        .and_hms_opt(8, 0, 0)
        .unwrap();
    
    // Si on est déjà après 8h, calculer jusqu'à 8h du lendemain
    if now.hour() >= 8 {
        tomorrow_8am = (now.date_naive() + chrono::Duration::days(1))
            .and_hms_opt(8, 0, 0)
            .unwrap();
    }
    
    let hours_until_morning = (tomorrow_8am.and_utc().timestamp() - now.naive_local().and_utc().timestamp()) as f32 / 3600.0;
    let hours_until_morning = hours_until_morning.max(1.0);
    let energy_wasted_until_morning = hours_until_morning * current_watts as f32;
    
    let co2_wasted = calculate_co2_saved(energy_wasted_until_morning);
    let trees_equivalent = calculate_trees_equivalent(co2_wasted);
    let car_km_equivalent = calculate_car_km_equivalent(co2_wasted);
    
    Ok(EcoData {
        current_watts,
        cpu_usage,
        memory_usage,
        battery_level: 100, // Tauri ne donne pas facilement accès à la batterie
        is_charging: false,
        session_duration_minutes: (session_duration_hours * 60.0) as u32,
        energy_wasted_wh: energy_wasted_until_morning as u32,
        hours_until_morning: (hours_until_morning * 10.0).round() / 10.0,
        co2_wasted_kg: (co2_wasted * 1000.0).round() / 1000.0,
        trees_equivalent: (trees_equivalent * 1000.0).round() / 1000.0,
        car_km_equivalent: (car_km_equivalent * 10.0).round() / 10.0,
        nightly_waste: energy_wasted_if_left_on as u32,
    })
}

#[tauri::command]
async fn shutdown_computer() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("shutdown")
            .args(["/s", "/f", "/t", "0"])
            .spawn()
            .map_err(|e| format!("Erreur lors de l'extinction: {}", e))?;
        Ok(())
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Err("Fonction disponible uniquement sur Windows".to_string())
    }
}

#[tauri::command]
async fn close_app(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

fn main() {
    let app_state = Arc::new(Mutex::new(AppState {
        session_start_time: std::time::Instant::now(),
        total_saved_energy: 0.0,
    }));

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_eco_data,
            shutdown_computer,
            close_app
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            // Configurer la fenêtre à 80% de la taille de l'écran
            if let Some(monitor) = window.current_monitor().ok().flatten() {
                let size = monitor.size();
                let window_width = (size.width as f64 * 0.8) as u32;
                let window_height = (size.height as f64 * 0.8) as u32;
                
                let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                    width: window_width,
                    height: window_height,
                }));
            }
            
            // Forcer la fenêtre au premier plan
            let _ = window.set_always_on_top(true);
            let _ = window.center();
            let _ = window.set_focus();
            let _ = window.show();
            
            // Forcer le focus pendant 30 secondes
            let window_clone = window.clone();
            std::thread::spawn(move || {
                for _ in 0..120 {
                    std::thread::sleep(std::time::Duration::from_millis(250));
                    let _ = window_clone.show();
                    let _ = window_clone.set_focus();
                    let _ = window_clone.set_always_on_top(true);
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

