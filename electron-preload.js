const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronOffline', Object.freeze({
  fetchImage: (url) => ipcRenderer.invoke('offline:fetch-image', url),
  resolveAsuraChapter: (url) => ipcRenderer.invoke('offline:resolve-asura-chapter', url)
}));
