import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, Notification } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// Documents folder path
const DOCUMENTS_DIR = path.join(app.getPath('documents'), 'OpenCraft');
if (!existsSync(DOCUMENTS_DIR)) {
  mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: path.join(__dirname, '../assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  // Prevent closing entirely, minimize to tray instead
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });

  win.on('maximize', () => win?.webContents.send('window-maximized', true));
  win.on('unmaximize', () => win?.webContents.send('window-maximized', false));
}

function createTray() {
  // Use a native sized icon for tray, but we'll try the png directly. 
  // On Windows, if it complains, we might need a specific tray icon.
  const iconPath = path.join(__dirname, '../assets/logo.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show OpenCraft', click: () => win?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('OpenCraft');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (win) {
      win.show();
      win.focus();
    }
  });
}

function setupGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (win) {
      win.show();
      win.focus();
      win.webContents.send('shortcut-quick-search');
    }
  });
}

function setupIPCFileSystem() {
  ipcMain.on('window-minimize', () => win?.minimize());
  ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
      win?.restore();
    } else {
      win?.maximize();
    }
  });
  ipcMain.on('window-close', () => win?.close());

  ipcMain.handle('fs-read-file', async (_, filename) => {
    const filepath = path.join(DOCUMENTS_DIR, filename);
    if (!existsSync(filepath)) return null;
    return await fs.readFile(filepath, 'utf8');
  });

  ipcMain.handle('fs-write-file', async (_, filename, content) => {
    const filepath = path.join(DOCUMENTS_DIR, filename);
    await fs.writeFile(filepath, content, 'utf8');
    return true;
  });

  ipcMain.handle('fs-delete-file', async (_, filename) => {
    const filepath = path.join(DOCUMENTS_DIR, filename);
    if (existsSync(filepath)) {
      await fs.unlink(filepath);
    }
    return true;
  });
  
  ipcMain.handle('fs-list-files', async () => {
    return await fs.readdir(DOCUMENTS_DIR);
  });
  
  ipcMain.handle('show-notification', (_, title, body) => {
    new Notification({ title, body, icon: path.join(__dirname, '../assets/logo.png') }).show();
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    setupGlobalShortcuts();
    setupIPCFileSystem();

    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
      args: ['--hidden'] // optionally start hidden
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
