const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow = null;

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
    app.quit();
}); 