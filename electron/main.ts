import { app, BrowserWindow, ipcMain, WebContentsView, BaseWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├─ index.html
// │ ├─ assets
// │ └── ...
// ├─┬─ dist-electron
// │ ├── main.js
// │ └── preload.js
//
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null
const views = new Map<string, WebContentsView>()

function updateViewBounds(id: string, bounds: Electron.Rectangle) {
  const view = views.get(id)
  if (!view || !win) return

  // Adjust bounds relative to the window content area
  // Note: We might need to account for title bar height if it wasn't hidden,
  // but since we use 'hidden' titleBarStyle, (0,0) is the top-left of the window.
  view.setBounds(bounds)
}


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    titleBarStyle: 'hidden', // Frameless window
    trafficLightPosition: { x: 10, y: 10 }, // Adjust traffic lights
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Open DevTools in development mode
    win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// --- BrowserView / WebContentsView IPC Handlers ---

ipcMain.handle('browser-view:create', (_, id: string, url: string, bounds: Electron.Rectangle) => {
  if (!win) return
  
  // If view already exists, just update it
  if (views.has(id)) {
    const view = views.get(id)!
    view.setBounds(bounds)
    return
  }

  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, // Secure sandbox for external content
    }
  })

  win.contentView.addChildView(view)
  view.setBounds(bounds)
  view.webContents.loadURL(url || 'about:blank')
  
  views.set(id, view)

  // Handle new windows (e.g. target="_blank") by loading in the same view or opening system browser
  view.webContents.setWindowOpenHandler(({ url }) => {
    // Optionally open in default system browser:
    // shell.openExternal(url)
    // return { action: 'deny' }
    
    // For now, let's load it in the same view if possible, or allow it
    // But for a widget, staying inside is usually better.
    view.webContents.loadURL(url)
    return { action: 'deny' }
  })
})

ipcMain.handle('browser-view:update-bounds', (_, id: string, bounds: Electron.Rectangle) => {
  updateViewBounds(id, bounds)
})

ipcMain.handle('browser-view:load', (_, id: string, url: string) => {
  const view = views.get(id)
  if (view) {
      if (!url.startsWith('http')) url = 'https://' + url
      view.webContents.loadURL(url)
  }
})

ipcMain.handle('browser-view:destroy', (_, id: string) => {
  const view = views.get(id)
  if (view && win) {
    // win.contentView.removeChildView(view) // Not strictly necessary if we rely on GC, but good practice
    // Error: removeChildView might not exist on older types, but it's cleaner.
    // Actually in newer Electron, just removing reference and closing might be enough, 
    // but explicit removal is safer.
    try {
        if (win.contentView.children.includes(view)) {
             win.contentView.removeChildView(view)
        }
    } catch (e) { console.error("Error removing view", e) }
    
    // Cleanup
    (view.webContents as any).destroy?.(); 
    views.delete(id)
  }
})

ipcMain.handle('browser-view:control', (_, id: string, action: 'back' | 'forward' | 'reload' | 'stop') => {
  const view = views.get(id)
  if (!view) return

  switch (action) {
    case 'back': if (view.webContents.canGoBack()) view.webContents.goBack(); break;
    case 'forward': if (view.webContents.canGoForward()) view.webContents.goForward(); break;
    case 'reload': view.webContents.reload(); break;
    case 'stop': view.webContents.stop(); break;
  }
})

ipcMain.handle('browser-view:zoom', (_, id: string, factor: number) => {
  const view = views.get(id)
  if (view) {
      view.webContents.setZoomFactor(factor)
  }
})

ipcMain.handle('browser-view:hide', (_, id: string) => {
    const view = views.get(id)
    if (view && win) {
        // Hide by moving off-screen or zero size
        view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
