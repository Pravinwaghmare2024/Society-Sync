
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SocietySync - Management Portal",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Enabling webSecurity as false temporarily to allow Babel standalone 
      // to fetch local TSX files via file:// protocol easily
      webSecurity: false 
    }
  });

  win.loadFile('index.html');
  
  // Uncomment the line below to open DevTools for debugging
  // win.webContents.openDevTools();
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
