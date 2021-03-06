'use strict'

let keyMirror = require('keymirror')

module.exports = keyMirror({
  BOOT: null,
  WINDOW_READY: null,
  SETUP_STATUS: null,
  SETUP_WAIT: null,
  SETUP_DONE: null,

  FOCUS_WINDOW: null,
  HIDE_WINDOW: null,
  LIBRARY_FOCUS_PANEL: null,

  /* Self updates */
  CHECK_FOR_SELF_UPDATE: null,
  CHECKING_FOR_SELF_UPDATE: null,
  SELF_UPDATE_AVAILABLE: null,
  SELF_UPDATE_NOT_AVAILABLE: null,
  SELF_UPDATE_ERROR: null,
  SELF_UPDATE_DOWNLOADED: null,
  APPLY_SELF_UPDATE: null,
  DISMISS_UPDATE_ERROR: null,

  /** User requested game to be installed */
  CAVE_QUEUE: null,
  /** User requested game to be uninstalled */
  CAVE_QUEUE_UNINSTALL: null,
  /** Internal cave DB needs to be updated */
  CAVE_UPDATE: null,
  /** Should probably replaced with an CaveStore.emit('change') event */
  CAVE_PROGRESS: null,
  /** Kaboom! */
  CAVE_IMPLODE: null,
  /** Bye bye. */
  CAVE_THROWN_INTO_BIT_BUCKET: null,
  /** i spy, i spy */
  CAVE_EXPLORE: null,
  /** Alright, what broke this time? */
  CAVE_PROBE: null,

  /** Set app-wide progress bar (title bar on Windows). Negative value clears. */
  SET_PROGRESS: null,
  /** OSX-only, bounce dock */
  BOUNCE: null,
  /** Cross-platform, notification bubble */
  NOTIFY: null,

  /* Data retrieval stuff */
  FETCH_GAMES: null,

  /** Ready but needs human login */
  NO_STORED_CREDENTIALS: null,
  /** Any login attempt (cached or not) */
  LOGIN_ATTEMPT: null,
  /** Private - login attempt with username/password */
  LOGIN_WITH_PASSWORD: null,
  /** Wrong login/password or something else */
  LOGIN_FAILURE: null,
  /** API key available beyond this point */
  AUTHENTICATED: null,
  /** db available beyond this point */
  READY_TO_ROLL: null,
  /** Asked to logout */
  CHANGE_USER: null,
  /** Confirmed logout */
  LOGOUT: null,

  /** Sent from metal when needs to eval something in chrome. Example: HTML5 Notification API */
  EVAL: null,

  /** Buh-bye */
  QUIT: null
})
