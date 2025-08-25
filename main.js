const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Use a simple fs.appendFileSync to log errors immediately.
function logError(message) {
    const logPath = path.join(app.getPath('userData'), 'error.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()}: ${message}\n`);
}

// Log a startup message to know the application started
logError('Application process started.');

const server = require('./server'); 

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const indexPath = path.join(__dirname, 'index.html');
    mainWindow.loadFile(indexPath);
}

app.whenReady().then(() => {
    try {
        logError('App is ready. Attempting to start server.');
        const destPath = path.join(process.resourcesPath, 'addresses.db');
        server.start(destPath);
        createWindow();
    } catch (error) {
        logError(`Initialization Error: ${error.message}`);
        dialog.showErrorBox('Initialization Error', 'Failed to initialize the application. Error: ' + error.message);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});