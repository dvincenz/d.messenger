'use strict'

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const defaultsDeep = require('@nodeutils/defaults-deep')



class DMessangerCore extends libp2p {
  constructor (_options) {
    const defaults = {
      modules: {
        transport: [
          TCP
        ]
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}
 
module.exports = DMessangerCore

