import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onMaximized: (callback: (isMax: boolean) => void) => ipcRenderer.on('window-maximized', (_, isMax) => callback(isMax)),
  
  // File System
  readFile: (filename: string) => ipcRenderer.invoke('fs-read-file', filename),
  writeFile: (filename: string, content: string) => ipcRenderer.invoke('fs-write-file', filename, content),
  deleteFile: (filename: string) => ipcRenderer.invoke('fs-delete-file', filename),
  listFiles: () => ipcRenderer.invoke('fs-list-files'),
  
  // Notifications
  notify: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),
  
  // Shortcuts
  onQuickSearch: (callback: () => void) => ipcRenderer.on('shortcut-quick-search', callback),
})
