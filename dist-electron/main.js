import { app, ipcMain, BrowserWindow, WebContentsView } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.DIST = path.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname$1, "../public");
let win;
const views = /* @__PURE__ */ new Map();
function updateViewBounds(id, bounds) {
  const view = views.get(id);
  if (!view || !win) return;
  view.setBounds(bounds);
}
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    titleBarStyle: "hidden",
    // Frameless window
    trafficLightPosition: { x: 10, y: 10 },
    // Adjust traffic lights
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
ipcMain.handle("browser-view:create", (_, id, url, bounds) => {
  if (!win) return;
  if (views.has(id)) {
    const view2 = views.get(id);
    view2.setBounds(bounds);
    return;
  }
  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
      // Secure sandbox for external content
    }
  });
  win.contentView.addChildView(view);
  view.setBounds(bounds);
  view.webContents.loadURL(url || "about:blank");
  views.set(id, view);
  view.webContents.setWindowOpenHandler(({ url: url2 }) => {
    view.webContents.loadURL(url2);
    return { action: "deny" };
  });
});
ipcMain.handle("browser-view:update-bounds", (_, id, bounds) => {
  updateViewBounds(id, bounds);
});
ipcMain.handle("browser-view:load", (_, id, url) => {
  const view = views.get(id);
  if (view) {
    if (!url.startsWith("http")) url = "https://" + url;
    view.webContents.loadURL(url);
  }
});
ipcMain.handle("browser-view:destroy", (_, id) => {
  var _a, _b;
  const view = views.get(id);
  if (view && win) {
    try {
      if (win.contentView.children.includes(view)) {
        win.contentView.removeChildView(view);
      }
    } catch (e) {
      console.error("Error removing view", e);
    }
    (_b = (_a = view.webContents).destroy) == null ? void 0 : _b.call(_a);
    views.delete(id);
  }
});
ipcMain.handle("browser-view:control", (_, id, action) => {
  const view = views.get(id);
  if (!view) return;
  switch (action) {
    case "back":
      if (view.webContents.canGoBack()) view.webContents.goBack();
      break;
    case "forward":
      if (view.webContents.canGoForward()) view.webContents.goForward();
      break;
    case "reload":
      view.webContents.reload();
      break;
    case "stop":
      view.webContents.stop();
      break;
  }
});
ipcMain.handle("browser-view:zoom", (_, id, factor) => {
  const view = views.get(id);
  if (view) {
    view.webContents.setZoomFactor(factor);
  }
});
ipcMain.handle("browser-view:hide", (_, id) => {
  const view = views.get(id);
  if (view && win) {
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
