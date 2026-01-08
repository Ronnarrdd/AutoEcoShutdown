// Import Tauri API
const { invoke } = window.__TAURI__.tauri;

let timeLeft = 15 * 60; // 15 minutes en secondes
const progressBar = document.getElementById('progress');
const shutdownCounter = document.getElementById('shutdownCounter');
const stayHereButton = document.getElementById('stayHereButton');
const tips = document.querySelectorAll('.tip-item');
const images = document.querySelectorAll('.image-item');
let currentTip = 0;

function showNextTip() {
    tips[currentTip].classList.remove('active');
    images[currentTip].classList.remove('active');
    currentTip = (currentTip + 1) % tips.length;
    tips[currentTip].classList.add('active');
    images[currentTip].classList.add('active');
}

function updateProgress() {
    const percentage = (timeLeft / (15 * 60)) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Update counter text
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    shutdownCounter.textContent = `Votre ordinateur s'éteindra au bout de : ${formattedTime} minutes`;

    if (timeLeft <= 4 * 60) { // 4 minutes restantes
        progressBar.classList.add('warning');
    }
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        invoke('shutdown_computer').catch(err => {
            console.error('Erreur lors de l\'extinction:', err);
        });
    }
    
    timeLeft--;
}

function closeApp() {
    invoke('close_app').catch(err => {
        console.error('Erreur lors de la fermeture:', err);
    });
}

// Afficher le premier conseil et image
if (tips.length > 0) tips[0].classList.add('active');
if (images.length > 0) images[0].classList.add('active');

// Changer de conseil toutes les 8 secondes
setInterval(showNextTip, 8000);

if (stayHereButton) {
    stayHereButton.addEventListener('click', closeApp);
}
const timer = setInterval(updateProgress, 1000);

// Fonction pour mettre à jour les données écologiques
async function updateEcoData() {
    try {
        const ecoData = await invoke('get_eco_data');
        
        // Calculs pour les équivalents visuels
        // On base tout sur l'énergie gaspillée totale (energy_wasted_wh)
        
        // 1 ampoule LED = ~10W
        // Combien d'ampoules allumées toute la durée restante ?
        // Energie = Puissance * Temps => Puissance = Energie / Temps
        // Puissance équivalente gaspillée = energy_wasted_wh / hours_until_morning
        // Nombre d'ampoules = Puissance équivalente / 10
        let bulbs = 0;
        if (ecoData.hours_until_morning > 0.1) {
            const equivalentPower = ecoData.energy_wasted_wh / ecoData.hours_until_morning;
            bulbs = Math.max(1, Math.round(equivalentPower / 10));
        } else {
            // Fallback si temps très court
            bulbs = Math.max(1, Math.round(ecoData.current_watts / 10));
        }
        
        // 1 charge smartphone = ~12Wh
        // Energie gaspillée (Wh) = ecoData.energy_wasted_wh
        const phones = Math.max(1, Math.round(ecoData.energy_wasted_wh / 12));
        
        // 1 tasse de café (chauffer l'eau) = ~25Wh
        const coffees = Math.max(1, Math.round(ecoData.energy_wasted_wh / 25));

        // 1 heure de TV LED (moyenne) = ~80Wh
        const tvHours = (ecoData.energy_wasted_wh / 80).toFixed(1);

        // Calcul du coût annuel (de 18h à 8h = 14h par jour)
        // Prix kWh = 0.2016€
        // Watt actuels / 1000 = kW
        // kW * 14h * 365j * Prix
        const kwhPrice = 0.2016;
        const dailyHours = 14; // 18h à 8h
        const currentKw = ecoData.current_watts / 1000;
        const yearlyCost = currentKw * dailyHours * 365 * kwhPrice;

        // Mettre à jour les métriques visuelles
        const bulbEl = document.getElementById('bulbEquivalent');
        if (bulbEl) bulbEl.textContent = bulbs;

        const phoneEl = document.getElementById('phoneEquivalent');
        if (phoneEl) phoneEl.textContent = phones;

        const coffeeEl = document.getElementById('coffeeEquivalent');
        if (coffeeEl) coffeeEl.textContent = coffees;

        const tvEl = document.getElementById('tvEquivalent');
        if (tvEl) tvEl.textContent = tvHours;
        
        // Mettre à jour le coût annuel
        const costEl = document.getElementById('yearCost');
        if (costEl) costEl.textContent = yearlyCost.toFixed(2) + ' €';

        const wattsDetailEl = document.getElementById('currentWattsDetail');
        if (wattsDetailEl) wattsDetailEl.textContent = ecoData.current_watts;
        
        const carEl = document.getElementById('carEquivalent');
        if (carEl) {
            if (ecoData.car_km_equivalent >= 0.1) {
                carEl.textContent = ecoData.car_km_equivalent.toFixed(1);
            } else {
                carEl.textContent = "quelques mètres";
            }
        }

        const treesEl = document.getElementById('treesEquivalent');
        if (treesEl) {
            if (ecoData.trees_equivalent >= 0.001) {
                treesEl.textContent = ecoData.trees_equivalent.toFixed(3);
            } else {
                treesEl.textContent = "une fraction d'";
            }
        }
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données écologiques:', error);
    }
}

// Fonction pour mettre à jour le graphique
async function updateChart() {
    try {
        const ecoData = await invoke('get_eco_data');
        const now = new Date();
        const timeLabel = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
        
        realTimeData.push(ecoData.current_watts);
        timeLabels.push(timeLabel);
        
        // Garder seulement les 20 derniers points
        if (realTimeData.length > 20) {
            realTimeData.shift();
            timeLabels.shift();
        }
        
        if (energyChart) energyChart.update();
    } catch (error) {
        console.error('Erreur lors de la mise à jour du graphique:', error);
    }
}

// Mettre à jour les données écologiques au démarrage et à l'affichage
updateEcoData(); // Première mise à jour (initialisation)

// On met à jour une seule fois quand la fenêtre prend le focus (donc quand elle s'affiche)
let hasUpdatedOnFocus = false;
window.addEventListener('focus', () => {
    if (!hasUpdatedOnFocus) {
        updateEcoData();
        hasUpdatedOnFocus = true;
    }
});

// Mettre à jour le graphique toutes les 10 secondes
updateChart(); // Première mise à jour immédiate
setInterval(updateChart, 10000);

// Création du graphique avec données temps réel
const ctx = document.getElementById('energyChart');
const realTimeData = [];
const timeLabels = [];
let energyChart = null;

if (ctx) {
    energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Consommation en Watts',
                data: realTimeData,
                fill: true,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(41, 177, 176, 0.1)');
                    gradient.addColorStop(0.5, 'rgba(0, 178, 185, 0.3)');
                    gradient.addColorStop(1, 'rgba(242, 159, 5, 0.4)');
                    return gradient;
                },
                borderColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, '#29B1B0');
                    gradient.addColorStop(0.5, '#00B2B9');
                    gradient.addColorStop(1, '#F29F05');
                    return gradient;
                },
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 120,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Rimouski'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Watts',
                        color: '#666',
                        font: {
                            family: 'Rimouski',
                            size: 14
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            family: 'Rimouski'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
