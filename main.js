const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const url = require('url');

// This is the key change: ensure your server is a module that can be imported
const server = require('./server'); 

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Pass the correct database path to the server before starting it
    const dbPath = path.join(process.resourcesPath, 'addresses.db');
    console.log(`Database path: ${dbPath}`);

    // Call a function in your server.js to start the server with the correct path
    server.start(dbPath);

    // Load the index.html file
    const startUrl = url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    });
    
    mainWindow.loadURL(startUrl);
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