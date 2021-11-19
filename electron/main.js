const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: !isDev,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }

  ipcMain.handle("show-message-box", (event, options) => {
    dialog.showMessageBox(win, options);
  });

  ipcMain.handle("show-open-dialog", (event, options) => {
    return dialog.showOpenDialog(win, options);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
