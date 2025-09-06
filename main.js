const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const si = require('systeminformation');

let mainWindow = null;
let sessionStartTime = Date.now();
let totalSavedEnergy = 0; // en Wh (Watts-heure)

// Fonctions de calcul écologique
function calculateCO2Saved(energySavedWh) {
    // 1 kWh = environ 0.5 kg CO2 en France (mix énergétique français)
    return (energySavedWh / 1000) * 0.5;
}

function calculateTreesEquivalent(co2SavedKg) {
    // Un arbre absorbe environ 22 kg de CO2 par an
    return co2SavedKg / 22;
}

function calculateCarKmEquivalent(co2SavedKg) {
    // Une voiture émet environ 0.12 kg CO2 par km
    return co2SavedKg / 0.12;
}

async function getRealPowerConsumption() {
    try {
        const cpuData = await si.currentLoad();
        const memData = await si.mem();
        const batteryData = await si.battery();
        
        // Estimation de consommation basée sur l'utilisation
        const basePower = 45; // Consommation de base en watts
        const cpuPower = (cpuData.currentLoad / 100) * 65; // Max 65W pour CPU
        const memoryPower = (memData.used / memData.total) * 15; // Max 15W pour RAM
        
        const totalWatts = Math.round(basePower + cpuPower + memoryPower);
        
        return {
            currentWatts: totalWatts,
            cpuUsage: Math.round(cpuData.currentLoad),
            memoryUsage: Math.round((memData.used / memData.total) * 100),
            batteryLevel: batteryData.percent || 100,
            isCharging: batteryData.isCharging || false
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // Valeurs par défaut en cas d'erreur
        return {
            currentWatts: 75,
            cpuUsage: 25,
            memoryUsage: 60,
            batteryLevel: 100,
            isCharging: false
        };
    }
}

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    // On prend 80% de la largeur et hauteur de l'écran
    const windowWidth = Math.floor(width * 0.8);
    const windowHeight = Math.floor(height * 0.8);

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        frame: false,
        transparent: true,
        resizable: true,
        center: true,
        show: false, // On cache la fenêtre jusqu'à ce qu'elle soit prête
        skipTaskbar: false, // S'assurer que la fenêtre apparaît dans la barre des tâches
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    
    // Attendre que la fenêtre soit prête avant de l'afficher
    mainWindow.webContents.on('did-finish-load', () => {
        // Forcer la visibilité et le focus
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.setVisibleOnAllWorkspaces(true);
        mainWindow.focus();
        mainWindow.moveTop();
        
        // Forcer le focus pendant 30 secondes
        let focusInterval = setInterval(() => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
                mainWindow.moveTop();
                mainWindow.setAlwaysOnTop(true, 'screen-saver');
                mainWindow.setVisibleOnAllWorkspaces(true);
            }
        }, 250);

        setTimeout(() => {
            clearInterval(focusInterval);
        }, 30000);
    });
    
    // Empêcher la minimisation
    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.show();
    });
    
    // Gérer la fermeture proprement
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('shutdown-computer', () => {
    exec('shutdown /s /f /t 0', (error) => {
        if (error) {
            console.error(`Erreur lors de l'extinction: ${error}`);
        }
    });
});

ipcMain.on('close-app', () => {
    // Calculer l'énergie économisée lors de cette session
    const sessionDurationHours = (Date.now() - sessionStartTime) / (1000 * 60 * 60);
    const averageWatts = 75; // Estimation moyenne
    const energySaved = sessionDurationHours * averageWatts;
    totalSavedEnergy += energySaved;
    
    app.quit();
});

// Nouveau gestionnaire pour les données écologiques
ipcMain.handle('get-eco-data', async () => {
    const powerData = await getRealPowerConsumption();
    const sessionDurationHours = (Date.now() - sessionStartTime) / (1000 * 60 * 60);
    
    // Calculer l'énergie qui serait gaspillée pendant une nuit complète (8 heures)
    const nightDurationHours = 8;
    const energyWastedIfLeftOn = nightDurationHours * powerData.currentWatts;
    
    // Calculer jusqu'au matin (supposons 8h30 du matin)
    const now = new Date();
    const tomorrow8AM = new Date();
    tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
    tomorrow8AM.setHours(8, 0, 0, 0);
    
    // Si on est déjà après 8h, calculer jusqu'à 8h du lendemain
    if (now.getHours() >= 8) {
        // On est dans la journée, calculer jusqu'à demain 8h
    } else {
        // On est avant 8h, calculer jusqu'à 8h aujourd'hui
        tomorrow8AM.setDate(tomorrow8AM.getDate() - 1);
    }
    
    const hoursUntilMorning = Math.max(1, (tomorrow8AM - now) / (1000 * 60 * 60));
    const energyWastedUntilMorning = hoursUntilMorning * powerData.currentWatts;
    
    const co2Wasted = calculateCO2Saved(energyWastedUntilMorning);
    const treesEquivalent = calculateTreesEquivalent(co2Wasted);
    const carKmEquivalent = calculateCarKmEquivalent(co2Wasted);
    
    return {
        ...powerData,
        sessionDurationMinutes: Math.round(sessionDurationHours * 60),
        energyWastedWh: Math.round(energyWastedUntilMorning),
        hoursUntilMorning: Math.round(hoursUntilMorning * 10) / 10,
        co2WastedKg: Math.round(co2Wasted * 1000) / 1000,
        treesEquivalent: Math.round(treesEquivalent * 1000) / 1000,
        carKmEquivalent: Math.round(carKmEquivalent * 10) / 10,
        nightlyWaste: Math.round(energyWastedIfLeftOn) // Pour une nuit type de 8h
    };
}); 