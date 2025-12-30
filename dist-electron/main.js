import { app as n, BrowserWindow as s } from "electron";
import o from "node:path";
import { fileURLToPath as r } from "node:url";
const i = o.dirname(r(import.meta.url));
process.env.DIST = o.join(i, "../dist");
process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST : o.join(i, "../public");
let e;
function t() {
  e = new s({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    titleBarStyle: "hidden",
    // Frameless window
    trafficLightPosition: { x: 10, y: 10 },
    // Adjust traffic lights
    webPreferences: {
      preload: o.join(i, "preload.js")
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(o.join(process.env.DIST, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && n.quit();
});
n.on("activate", () => {
  s.getAllWindows().length === 0 && t();
});
n.whenReady().then(t);
