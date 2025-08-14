const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const AppiumManager = require('./AppiumManager');

app.disableHardwareAcceleration();
const manager = new AppiumManager();

ipcMain.handle('get-devices', async () => {
  const devices = await manager.getDevices();
  console.log('Devices found:', devices);
  return devices;
});

ipcMain.handle('get-session', async (e, deviceId) => {
  console.log('Getting session for:', deviceId);
  const result = await manager.getSession(deviceId);
  console.log('Session result:', result);
  return result;
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true
    }
  });
  win.loadFile('index.html');
  win.webContents.openDevTools();
});

app.on('before-quit', async () => await manager.cleanup());