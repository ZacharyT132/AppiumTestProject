const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appiumAPI', {
  startServer: (port) => ipcRenderer.invoke('start-appium', port),
  stopServer: () => ipcRenderer.invoke('stop-appium'),
  createSession: (capabilities) => ipcRenderer.invoke('create-session', capabilities),
  getDevices: () => ipcRenderer.invoke('get-devices')
});
