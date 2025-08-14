const { ipcMain } = require('electron');
const AppiumManager = require('./AppiumManager');

// Single instance for entire app lifecycle
const appiumManager = new AppiumManager();

function setupIpcHandlers() {
  // Server Commands
  ipcMain.handle('appium:start-server', async (event, { deviceId }) => {
    try {
      return await appiumManager.createServerForDevice(deviceId);
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('appium:stop-server', async (event, { deviceId }) => {
    return await appiumManager.stopServerForDevice(deviceId);
  });

  ipcMain.handle('appium:server-status', async (event, { deviceId }) => {
    return appiumManager.getServerStatus(deviceId);
  });

  // Device Commands
  ipcMain.handle('appium:get-devices', async () => {
    return appiumManager.getDevices();
  });

  // Session Commands
  ipcMain.handle('appium:get-session', async (event, { deviceId }) => {
    try {
      return await appiumManager.getOrCreateSession(deviceId);
    } catch (error) {
      return { error: error.message };
    }
  });

  ipcMain.handle('appium:close-session', async (event, { deviceId }) => {
    await appiumManager.cleanupSession(deviceId);
    return { success: true };
  });

  ipcMain.handle('appium:session-health', async (event, { deviceId }) => {
    return await appiumManager.getSessionHealth(deviceId);
  });

  // Cleanup on app quit
  ipcMain.handle('appium:cleanup', async () => {
    await appiumManager.cleanup();
    return { success: true };
  });
}

module.exports = { setupIpcHandlers, appiumManager };