const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,
  platform: process.platform,
  exportFile: (title, content) => ipcRenderer.invoke("export-file", { title, content }),
  importFile: () => ipcRenderer.invoke("import-file"),
  showNotification: (title, body) => ipcRenderer.send("show-notification", { title, body }),
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  onMaximized: (callback) => {
    const subscription = (event, isMaximized) => callback(isMaximized);
    ipcRenderer.on("window-is-maximized", subscription);
    return () => {
      ipcRenderer.removeListener("window-is-maximized", subscription);
    };
  }
});
