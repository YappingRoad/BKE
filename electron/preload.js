const { contextBridge, ipcRenderer } = require('electron/renderer')
contextBridge.exposeInMainWorld('electronAPI', {
    showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    setAccentColor: (colorString) => ipcRenderer.send('set-accent-color', colorString),
    discord_setActivity: (activity) => ipcRenderer.send('discord_set-activity', activity),
    Memory_getMemoryUsed: () => { return ipcRenderer.invoke('memory_get-memory-used') },
    Memory_getCPUUsage: () => { return ipcRenderer.invoke('memory_get-cpu-usage') },
})
