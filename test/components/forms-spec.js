'use strict'

let test = require('zopf')
let proxyquire = require('proxyquire')
let sd = require('skin-deep')

let electron = require('../stubs/electron')

let $ = require('react').createElement

test('forms', t => {
  let InputRow = proxyquire('../../app/components/forms', electron).InputRow

  let props = {
    autofocus: true,
    disabled: true,
    name: 'al'
  }

  t.case('InputRow', t => {
    let tree = sd.shallowRender($(InputRow, props))

    let label = tree.subTree('label')
    t.ok(label)

    let input = label.findNode('input')
    t.ok(input)
    t.ok(input.props.disabled)
    t.is(input.props.placeholder, props.name)

    let instance = tree.getMountedInstance()
    let fake_input = {
      value: 'bozo',
      focus: () => null
    }
    // __proto__ is bad and I should feel bad but then again
    // refs is non-extensible... - amos
    instance.refs[`__proto__`].input = fake_input
    t.mock(fake_input).expects('focus').once()
    instance.componentDidMount()

    t.is(instance.value(), 'bozo')
    delete instance.refs[`__proto__`].input
  })
})
