const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { main: appiumMain } = require('appium');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

let mainWindow;
let appiumServer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (appiumServer) {
    appiumServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// IPC handlers
ipcMain.handle('start-appium', async (event, port = 4723) => {
  try {
    if (appiumServer) {
      return { success: false, message: 'Server already running' };
    }
    
    appiumServer = await appiumMain({
      port,
      host: '127.0.0.1',
      basePath: '/wd/hub',
      noPermsCheck: true,
      logLevel: 'info'
    });
    
    return { success: true, message: `Server started on port ${port}` };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('stop-appium', async () => {
  try {
    if (!appiumServer) {
      return { success: false, message: 'No server running' };
    }
    
    await appiumServer.close();
    appiumServer = null;
    return { success: true, message: 'Server stopped' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('create-session', async (event, capabilities) => {
  try {
    const { remote } = require('webdriverio');
    
    const driver = await remote({
      capabilities,
      hostname: '127.0.0.1',
      port: 4723,
      path: '/wd/hub',
      logLevel: 'info'
    });
    
    const sessionId = driver.sessionId;
    await driver.deleteSession();
    
    return { success: true, sessionId, message: 'Session created and closed' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('get-devices', async () => {
  const devices = { android: [], ios: [] };
  
  // Get Android devices
  try {
    const { stdout } = await execAsync('adb devices');
    const lines = stdout.split('\n').slice(1);
    for (const line of lines) {
      const [id, status] = line.trim().split('\t');
      if (id && status === 'device') {
        const model = await execAsync(`adb -s ${id} shell getprop ro.product.model`).catch(() => ({ stdout: id }));
        devices.android.push({
          id,
          name: model.stdout.trim() || id,
          type: 'android'
        });
      }
    }
  } catch (e) {}
  
  // Get iOS simulators
  try {
    const { stdout } = await execAsync('xcrun simctl list devices available -j');
    const data = JSON.parse(stdout);
    for (const runtime in data.devices) {
      if (runtime.includes('iOS')) {
        for (const device of data.devices[runtime]) {
          if (device.state === 'Booted') {
            devices.ios.push({
              id: device.udid,
              name: device.name,
              type: 'ios'
            });
          }
        }
      }
    }
  } catch (e) {}
  
  return devices;
});
