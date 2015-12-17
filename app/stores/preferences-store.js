'use strict'

// let AppActions = require('../actions/app-actions')
let AppDispatcher = require('../dispatcher/app-dispatcher')
let AppConstants = require('../constants/app-constants')
let Store = require('./store')

// let app = require('electron').app
let BrowserWindow = require('electron').BrowserWindow
let window

let PreferencesStore = Object.assign(new Store('preferences-store'), {
  with: (f) => {
    if (!window) return
    f(window)
  }
})

function show () {
  if (window) {
    // AppActions.gain_focus()
    window.show()
    return
  }

  window = new BrowserWindow({
    icon: './static/images/itchio-tray-x4.png',
    width: 800,
    height: 600,
    resizable: false,
    center: true,
    show: false,
    frame: false,
    'title-bar-style': 'hidden'
  })

  window.webContents.on('dom-ready', (e) => {
    // AppActions.window_ready()
    window.show()
  })
  window.loadURL(`file://${__dirname}/../preferences.html`)
}

AppDispatcher.register('preferences-store', Store.action_listeners(on => {
  on(AppConstants.OPEN_PREFERENCES, show)
}))

module.exports = PreferencesStore
