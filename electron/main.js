//#region ELECTRON
const { app, BrowserWindow, protocol, Menu, ipcMain, Notification } = require('electron/main');
const { Client } = require("@xhayper/discord-rpc");
const path = require('node:path')


app.disableDomainBlockingFor3DAPIs();
if (process.platform == 'win32') {
  app.setUserTasks([]);
}
// app.disableHardwareAcceleration();
let win;
let discord;
const dev = true;

const hidDevices = [
  // Dualsense Controller (PS5)
  { vendorId: 0x054c, productId: 0x0ce6 },
  // Wiimote
  { vendorId: 0x057e, productId: 0x0306 },
  // Joy-con L & R
  { vendorId: 0x057e, productId: 0x2006 },
  { vendorId: 0x057e, productId: 0x2007 }

];

function createWindow() {
  Menu.setApplicationMenu(null)
  win = new BrowserWindow({
    width: 640,
    height: 360,
    titleBarStyle: 'hiddenInset',
    useContentSize: true,
    backgroundColor: "#000",
    simpleFullscreen: true,
    // titleBarOverlay: process.platform == 'linux' ? { color: "rgb(56, 60, 142)" } : undefined,
    icon: "assets/manifest/icon.png",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: false,
      devTools: dev,
      v8CacheOptions: 'bypassHeatCheckAndEagerCompile',
      additionalArguments: [
        '--disable-vsync-for-tests',
        '--disable-renderer-accessibility',
        '--disable-gpu-vsync',
        // '--disable-frame-rate-limit',

        // '--max-gum-fps="9999"',

        '--disable-background-networking',
        '--disable-legacy-window',
        '--disable-lcd-text',
        '--disable-font-subpixel-positioning',
        '--enable-native-gpu-memory-buffers',
        '--no-xr-runtime',
        '--webgl-antialiasing-mode=none',

        // '--d3d11on12',
        // '--vulkan'
        // '--use-gl=desktop'
      ]
    },
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  })

  win.setHasShadow(false);
  win.setFullScreenable(true);
  win.setFullScreen(true);


  win.loadFile('index.html');

  // win.webContents.session.setPermissionRequestHandler(()=>{
  //   return true;
  // });
  // win.webContents.session.setPermissionCheckHandler(()=>{
  //   return true;
  // });
  win.webContents.session.setDevicePermissionHandler(() => {
    return true;
  });
  win.webContents.session.on("select-hid-device", (ev, details, callback) => {
    details.deviceList.forEach((dev) => {
      callback(dev.deviceId)
    })
  })
  if (dev) {
    win.webContents.openDevTools();
  }

  discord = new Discord();
}

//#region IPC
function handleShowNotification(event, title, body) {
  new Notification({ title: title, body: body, icon: "assets/manifest/icon.png" }).show()
}

function handleToggleFullscreen(event) {
  if (win instanceof BrowserWindow) {
    win.setFullScreen(!win.isFullScreen());
  }
}

function handleSetAccentColor(event, colorString) {
  if (process.platform == 'win32') {
    win.setAccentColor(colorString);
  }
}


app.whenReady().then(() => {
  ipcMain.on('show-notification', handleShowNotification)
  ipcMain.on('toggle-fullscreen', handleToggleFullscreen)
  ipcMain.handle('set-accent-color', handleSetAccentColor)

  ipcMain.handle('memory_get-memory-used', (ev, _) => { return Memory.getMemoryUsed() })
  ipcMain.handle('memory_get-cpu-usage', (ev, _) => { return Memory.getCPUUsage() })

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  });

  ipcMain.on('discord_set-activity', (ev, ...args) => { discord.setActivity(args[0]); })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
//#endregion

//#endregion

//#region DISCORD API
class Discord {
  client;
  ready = false;
  constructor() {
    this.client = new Client({
      clientId: "1414140482228850768"
    });
    this.client.on("ready", () => {
      this.ready = true;
      if (this.client.user !== undefined) {
        this.client.user.setActivity({
          largeImageKey: "bill",
          largeImageText: "Bill Kolumbert",
          startTimestamp: app.getAppMetrics()[0].creationTime,
        }).catch(() => { });
      }
    });

    this.client.login().catch(() => { });
  }

  setActivity(activity) {
    if (this.ready) {
      if (this.client.user !== undefined) {
        let obj = JSON.parse(activity);
        obj.startTimestamp = this.startTime;
        this.client.user.setActivity(obj).catch(() => { });;
      }
    }
  }
}
//#endregion

//#region MEMORY
class Memory {
  static toMB(data) {
    return parseFloat((data / 1000).toFixed(3));
  }
  static async getMemoryUsed() {
    let info = (await process.getProcessMemoryInfo());
    return Memory.toMB(info.private)
  }

  static getCPUUsage() {
    return process.getCPUUsage().percentCPUUsage
  }
}
//#endregion