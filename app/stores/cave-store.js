'use strict'

let AppDispatcher = require('../dispatcher/app-dispatcher')
let AppConstants = require('../constants/app-constants')
let AppActions = require('../actions/app-actions')
let Store = require('./store')
let CredentialsStore = require('./credentials-store')

let errors = require('../tasks/errors')
let Transition = errors.Transition
let InputRequired = errors.InputRequired
let Crash = errors.Crash

let app = require('electron').app
let path = require('path')

let Logger = require('../util/log').Logger
let log = require('../util/log')('cave-store')
let db = require('../util/db')

let library_dir = path.join(app.getPath('home'), 'Downloads', 'itch.io')
let archives_dir = path.join(library_dir, 'archives')
let apps_dir = path.join(library_dir, 'apps')

let logger = new Logger()
let opts = {logger}

const CAVE_TABLE = 'caves'

let CaveStore = Object.assign(new Store('cave-store'), {
  find: function (id) {
    return db.find_one({_table: CAVE_TABLE, _id: id})
  },

  find_for_game: function (game_id) {
    return db.find_one({_table: CAVE_TABLE, game_id: game_id})
  },

  archive_path: function (upload) {
    log(opts, `In archive_path, me = ${JSON.stringify(CredentialsStore.get_me())}`)
    return path.join(archives_dir, `${upload.id}${path.extname(upload.filename)}`)
  },

  app_path: function (cave_id) {
    return path.join(apps_dir, cave_id)
  }
})

let natural_transitions = {
  'find-upload': 'download',
  'download': 'install',
  'install': 'configure'
}

function handle_task_error (err, id, task_name) {
  if (err instanceof Transition) {
    log(opts, `[${task_name} => ${err.to}] ${err.reason}`)
    let data = err.data || {}
    setImmediate(() => queue_task(id, err.to, data))
  } else if (err instanceof InputRequired) {
    let msg = `(stub) input required by ${task_name}`
    log(opts, msg)
    AppActions.cave_progress({id, task: 'error', error: msg})
  } else if (err instanceof Crash) {
    let msg = `crashed with: ${JSON.stringify(err, null, 2)}`
    log(opts, msg)
    AppActions.cave_progress({id, task: 'idle', error: msg})
  } else {
    log(opts, err.stack || err)
    AppActions.cave_progress({id, task: 'error', error: '' + err})
  }
}

let current_tasks = {}

function every_task () {
  let tasks = []
  for (let key of Object.keys(current_tasks)) {
    tasks.push(current_tasks[key])
  }
  return tasks
}

function num_downloads () {
  let count = 0
  for (let task of every_task()) {
    if (task.name === 'download') count++
  }
  return count
}

let max_downloads = 2

function recheck_pending_tasks () {
  let num_dl = num_downloads()

  if (num_dl >= max_downloads) {
    return
  }

  for (let task of every_task()) {
    if (task.name === 'download-queued') {
      task.opts.emitter.emit('shine')
      break
    }
  }
}

function set_current_task (id, data) {
  // potentially send an event here
  if (data) {
    current_tasks[id] = data
  } else {
    delete current_tasks[id]
    // maybe a download finished?
    recheck_pending_tasks()
  }
}

async function queue_task (id, task_name, data) {
  try {
    if (typeof data === 'undefined') {
      data = {}
    }

    if (current_tasks[id]) {
      log(opts, `task already in progress for ${id}, ignoring ${task_name} request`)
      return
    }

    if (task_name === 'download' && num_downloads() >= max_downloads) {
      log(opts, `too many downloads, will download ${id} later`)
      let emitter = Object.assign({}, require('events').EventEmitter.prototype)
      queue_task(id, 'download-queued', {emitter})
      return
    }

    let task = require(`../tasks/${task_name}`)
    let task_opts = Object.assign({}, opts, data, {
      id,
      onprogress: (state) => {
        AppActions.cave_progress({id, progress: state.percent * 0.01, task: task_name})
      }
    })
    log(opts, `starting ${task_name}`)
    AppActions.cave_progress({id, progress: 0, task: task_name})

    set_current_task(id, {
      name: task_name,
      opts: task_opts
    })
    let res = await task.start(task_opts)
    set_current_task(id, null)

    if (task_name === 'install') {
      let cave = await CaveStore.find(id)
      if (!cave.success_once) {
        let game = await db.find_one({_table: 'games', id: cave.game_id})
        AppActions.notify(`${game.title} is ready!`)
        AppActions.cave_update(id, {success_once: true})
      }
    }

    let transition = natural_transitions[task_name]
    if (transition) throw new Transition({to: transition})

    log(opts, `task ${task_name} finished with ${JSON.stringify(res)}`)
    AppActions.cave_progress({id, progress: 0})

    if (task_opts.then) {
      queue_task(id, task_opts.then)
    } else {
      AppActions.cave_progress({id, task: 'idle'})
    }
  } catch (err) {
    set_current_task(id, null)
    handle_task_error(err, id, task_name)
  }
}

function initial_progress (record) {
  AppActions.cave_progress(Object.assign({id: record._id}, record))
  db.find_one({_table: 'games', id: record.game_id}).then(game => {
    AppActions.cave_progress({id: record._id, game})
  })
}

async function queue_cave (game_id) {
  let data = { _table: CAVE_TABLE, game_id }
  let record = await db.insert(data)

  initial_progress(record)
  queue_task(record._id, 'download')
}

function update_cave (_id, data) {
  return db.merge_one({_table: CAVE_TABLE, _id}, data)
}

function implode_cave (data) {
  db.remove({_table: CAVE_TABLE, _id: data.id})
  AppActions.cave_thrown_into_bit_bucket(data.id)
}

AppDispatcher.register('cave-store', Store.action_listeners(on => {
  on(AppConstants.CAVE_QUEUE, async action => {
    let record = await db.find_one({_table: CAVE_TABLE, game_id: action.game_id})

    if (record) {
      if (record.launchable) {
        queue_task(record._id, 'launch')
      } else {
        log(opts, `asked to launch ${record._id} but isn't launchable, ignoring`)
      }
    } else {
      queue_cave(action.game_id)
    }
  })

  on(AppConstants.CAVE_QUEUE_UNINSTALL, async action => {
    let record = await db.find_one({_table: CAVE_TABLE, _id: action.id})

    if (record) {
      queue_task(record._id, 'uninstall')
    } else {

    }
  })

  on(AppConstants.CAVE_UPDATE, action => {
    return update_cave(action.id, action.data)
  })

  on(AppConstants.CAVE_IMPLODE, implode_cave)

  on(AppConstants.AUTHENTICATED, action => {
    return (
      db.load()
      .then(() => db.find({_table: CAVE_TABLE}))
      .each((record, i) => {
        initial_progress(record)
        queue_task(record._id, 'download')
      })
    )
  })
}))

module.exports = CaveStore
