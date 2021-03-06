'use strict'

let indexBy = require('underscore').indexBy

let Store = require('./store')
let CredentialsStore = require('./credentials-store')

let AppDispatcher = require('../dispatcher/app-dispatcher')
let AppConstants = require('../constants/app-constants')
let AppActions = require('../actions/app-actions')

let db = require('../util/db')

let state = {}

let CollectionStore = Object.assign(new Store('collection-store'), {
  get_state: () => state
})

function merge_state (obj) {
  Object.assign(state, obj)
  CollectionStore.emit_change()
}

function cache_collections () {
  db.find({_table: 'collections'})
    .then(collections => indexBy(collections, 'id'))
    .then(merge_state)
    .then(() => Object.keys(state))
    .map(cid => AppActions.fetch_games(`collections/${cid}`))
}

function ready_to_roll () {
  cache_collections()

  let user = CredentialsStore.get_current_user()
  user.my_collections()
    .then(res => res.collections)
    .then(db.save_collections)
    .then(cache_collections)
}

AppDispatcher.register('collection-store', Store.action_listeners(on => {
  on(AppConstants.LOGOUT, (action) => {
    state = {}
    CollectionStore.emit_change()
  })
  on(AppConstants.READY_TO_ROLL, ready_to_roll)
}))

module.exports = CollectionStore
