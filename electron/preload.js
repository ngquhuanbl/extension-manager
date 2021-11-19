const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dialog', {
  showMessageBox: (options = {}) => ipcRenderer.invoke('show-message-box', options),
  showOpenDialog: (options = {}) => ipcRenderer.invoke('show-open-dialog', options)
})