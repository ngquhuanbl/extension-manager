const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { readFileSync } = require("fs");

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
    return dialog.showMessageBox(win, options);
  });

  ipcMain.handle("show-message-box-sync", (event, options) => {
    return dialog.showMessageBoxSync(win, options);
  });

  ipcMain.handle("show-open-dialog", async (event, options) => {
    const { filePaths, ...rest } = await dialog.showOpenDialog(win, options);

    const base64FilePaths = filePaths.map((filePath) => {
      const dataString = readFileSync(filePath).toString('base64');
      return `data:image/png;base64,${dataString}`
    })
    return {
      ...rest,
      filePaths: base64FilePaths
    }
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
