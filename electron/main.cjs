const { app, BrowserWindow, ipcMain, dialog, Notification } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const express = require("express");

let mainWindow;

// Convert Express request to standard Web API Request
function createWebRequest(req) {
  const url = `http://${req.headers.host}${req.originalUrl}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.append(key, value);
  }
  return new Request(url, {
    method: req.method,
    headers,
  });
}

async function startLocalServer() {
  const serverApp = express();

  // Serve static assets from dist/client
  serverApp.use(express.static(path.join(__dirname, "../dist/client")));

  // Dynamically import the TanStack Start SSR handler
  // Note: Unpacked asar path because node's native import can't load from .asar
  let serverHandler;
  try {
    let serverPath = path.join(__dirname, "../dist/server/server.js");
    if (serverPath.includes("app.asar")) {
      serverPath = serverPath.replace("app.asar", "app.asar.unpacked");
    }
    // Windows paths need to be properly formatted as file URLs
    const serverModuleUrl = "file://" + serverPath.replace(/\\/g, "/");
    const serverEntry = await import(serverModuleUrl);
    serverHandler = serverEntry.default;
  } catch (err) {
    console.error("Failed to load SSR handler:", err);
  }

  // Intercept all other requests and send them to the SSR handler
  serverApp.use(async (req, res) => {
    if (!serverHandler) return res.status(500).send("SSR handler not loaded.");

    try {
      const webReq = createWebRequest(req);
      const webRes = await serverHandler.fetch(webReq);

      webRes.headers.forEach((value, key) => {
        res.append(key, value);
      });
      res.status(webRes.status);

      const arrayBuffer = await webRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error("SSR error:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  return new Promise((resolve) => {
    const srv = serverApp.listen(0, "127.0.0.1", () => {
      resolve(`http://127.0.0.1:${srv.address().port}`);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // frameless window for sleek brutalist aesthetics
    titleBarStyle: "hidden", // macOS support for traffic lights inside title area
    backgroundColor: "#161616", // match OpenCraft background color to avoid flashing
    show: false, // show window only when ready to prevent flash of empty white content
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  let startUrl = process.env.ELECTRON_START_URL;
  if (!startUrl) {
    if (app.isPackaged) {
      startUrl = await startLocalServer();
    } else {
      startUrl = "http://localhost:8543";
    }
  }

  mainWindow.loadURL(startUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Track maximized state to send to frontend for custom window buttons
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-is-maximized", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-is-maximized", false);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── Native File Export ──────────────────────────────────────────────────────
ipcMain.handle("export-file", async (event, { title, content }) => {
  if (!mainWindow) return { success: false, error: "No window active" };

  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: "Export Document as Markdown",
      defaultPath: `${title || "untitled"}.md`,
      filters: [{ name: "Markdown Files", extensions: ["md", "markdown"] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    await fs.writeFile(filePath, content, "utf-8");
    return { success: true, filePath };
  } catch (error) {
    console.error("Failed to export file:", error);
    return { success: false, error: error.message };
  }
});

// ─── Native File Import ──────────────────────────────────────────────────────
ipcMain.handle("import-file", async () => {
  if (!mainWindow) return null;

  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: "Import Markdown Document",
      filters: [{ name: "Markdown Files", extensions: ["md", "markdown"] }],
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }

    const filePath = filePaths[0];
    const filename = path.basename(filePath, path.extname(filePath));
    const content = await fs.readFile(filePath, "utf-8");

    return { title: filename, content };
  } catch (error) {
    console.error("Failed to import file:", error);
    return null;
  }
});

// ─── Custom Window Controls ──────────────────────────────────────────────────
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close();
});

// ─── Desktop Notifications ───────────────────────────────────────────────────
ipcMain.on("show-notification", (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || "OpenCraft",
      body: body || "",
      silent: false,
    });
    notification.show();
  }
});
