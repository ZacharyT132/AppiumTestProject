const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  getSession: (deviceId) => ipcRenderer.invoke('get-session', deviceId)
});