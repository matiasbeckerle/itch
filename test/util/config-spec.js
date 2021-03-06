'use strict'

let test = require('zopf')
let proxyquire = require('proxyquire')

let electron = require('../stubs/electron')

test('config', t => {
  let nconf = {
    file: () => null,
    get: () => null,
    set: () => null,
    clear: () => null,
    save: () => null
  }
  let stubs = Object.assign({ nconf }, electron)

  t.stub(nconf, 'file').throws()

  let config = proxyquire('../../app/util/config', stubs)

  t.case('save', t => {
    t.mock(nconf).expects('save').once()
    config.save()
  })

  t.case('save err', t => {
    t.mock(nconf).expects('save').once().callsArgWith(0, 'uh oh')
    config.save()
  })

  t.case('set', t => {
    let mock = t.mock(nconf)
    mock.expects('set').once()
    mock.expects('save').once()
    config.set('key', 'val')
  })

  t.case('clear', t => {
    let mock = t.mock(nconf)
    mock.expects('clear').once()
    mock.expects('save').once()
    config.clear('key')
  })

  t.case('get', t => {
    let mock = t.mock(nconf)
    mock.expects('get').once()
    config.get('key')
  })
})
