const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "SocietySync",
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Disable web security for local file fetching of bundled assets
      webSecurity: false
    }
  });

  // Load the index.html file
  win.loadFile('index.html');

  // Toggle this for debugging if the screen is still blank
  // win.webContents.openDevTools();

  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});