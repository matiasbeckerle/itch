'use strict'

let mori = require('mori')
let r = require('r-dom')
let Component = require('./component')

let LoginPage = require('./login').LoginPage
let LibraryPage = require('./library').LibraryPage

let AppStore = require('../stores/app-store')
let defer = require('../util/defer')

function get_state () {
  return {state: AppStore.get_state()}
}

class Layout extends Component {
  constructor () {
    super()
    this.state = get_state()
  }

  componentDidMount () {
    AppStore.add_change_listener('layout', () => {
      defer(() => { this.setState(get_state()) })
    })
  }

  componentWillUnmount () {
    AppStore.remove_change_listener('layout')
  }

  render () {
    let state = this.state.state

    switch (mori.get(state, 'page')) {
      case 'login':
      case 'setup':
        return r(LoginPage, {state})
      case 'library':
        return r(LibraryPage, {state: mori.get(state, 'library'), update: mori.get(state, 'update')})
      default:
        return r.div()
    }
  }
}

module.exports = {Layout}
