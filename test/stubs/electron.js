'use strict'

let rnil = () => null
let EventEmitter = require('events').EventEmitter

let electron = {
  '@noCallThru': true,
  '@global': true,
  app: {
    getVersion: () => '1.0',
    getPath: () => 'tmp/',
    makeSingleInstance: (cb) => false,
    quit: rnil,
    on: rnil,
    dock: {
      setMenu: rnil,
      bounce: rnil,
      setBadge: rnil
    }
  },
  Tray: function () {
    Object.assign(this, electron.Tray)
  },
  BrowserWindow: function () {
    Object.assign(this, electron.BrowserWindow)
  },
  ipcMain: Object.assign({}, EventEmitter.prototype),
  ipcRenderer: Object.assign({
    send: function () {
      let args = []
      for (let i = 0; i < arguments.length; i++) {
        args.push(arguments[i])
      }
      args.splice(1, 0, {}) // inject fake 'ev' object
      electron.ipcMain.emit.apply(electron.ipcMain, args)
    }
  }, EventEmitter.prototype),
  remote: {
    require: () => {}
  },
  shell: {
    openItem: rnil,
    openExternal: rnil
  },
  dialog: {
    showMessageBox: rnil
  },
  Menu: {
    buildFromTemplate: rnil,
    setApplicationMenu: rnil
  }
}

Object.assign(electron.Tray, {
  setToolTip: rnil,
  setContextMenu: rnil,
  on: rnil,
  displayBalloon: rnil // win32-only
})

let webContents = {
  on: (e, cb) => cb(),
  executeJavaScript: rnil
}

Object.assign(electron.BrowserWindow, {
  getAllWindows: () => [],
  setProgressBar: rnil,
  on: rnil,
  openDevTools: rnil,
  loadURL: rnil,
  hide: rnil,
  show: rnil,
  webContents
})

module.exports = {
  'electron': electron
}
