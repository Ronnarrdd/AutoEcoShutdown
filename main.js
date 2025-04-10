const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    // On prend 80% de la largeur et hauteur de l'écran
    const windowWidth = Math.floor(width * 0.8);
    const windowHeight = Math.floor(height * 0.8);

    const win = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        frame: false,
        transparent: true,
        resizable: true,
        center: true, // Centre automatiquement la fenêtre
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    win.setAlwaysOnTop(true);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
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