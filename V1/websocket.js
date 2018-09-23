'use strict'

const libp2p = require('libp2p')
const WebSockets = require('libp2p-websockets')
const PeerInfo = require('peer-info')
const waterfall = require('async/waterfall')
const defaultsDeep = require('@nodeutils/defaults-deep')
const parallel = require('async/parallel')
const pull = require('pull-stream')

class MyBundle extends libp2p {
  constructor (_options) {
    const defaults = {
      modules: {
        transport: [
          WebSockets
        ]
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}

function createNode (addrs, callback) {
  if (!Array.isArray(addrs)) {
    addrs = [addrs]
  }

  let node

  waterfall([
    (cb) => PeerInfo.create(cb),
    (peerInfo, cb) => {
      addrs.forEach((addr) => peerInfo.multiaddrs.add(addr))
      node = new MyBundle({ peerInfo: peerInfo })
      node.start(cb)
    }
  ], (err) => callback(err, node))
}

function printAddrs (node, number) {
  console.log('node %s is listening on:', number)
  node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))
}

function print (protocol, conn) {
  pull(
    conn,
    pull.map((v) => v.toString()),
    pull.log()
  )
}

parallel([
  (cb) => createNode('/ip4/127.0.0.1/tcp/30000/ws', cb),
  (cb) => createNode('/ip4/127.0.0.1/tcp/10000/ws', cb),
  (cb) => createNode('/ip4/127.0.0.1/tcp/20000/ws', cb)
], (err, nodes) => {
  if (err) { throw err }

  const node1 = nodes[0]
  const node2 = nodes[1]
  const node3 = nodes[2]

  printAddrs(node1, '1')
  printAddrs(node2, '2')
  printAddrs(node3, '3')

  node1.handle('/print', print)
  node2.handle('/print', print)
  node3.handle('/print', print)

  node1.dialProtocol(node2.peerInfo, '/print', (err, conn) => {
    if (err) { throw err }

    pull(pull.values(['node 1 dialed to node 2 successfully']), conn)
  })

  node2.dialProtocol(node3.peerInfo, '/print', (err, conn) => {
    if (err) { throw err }

    pull(pull.values(['node 2 dialed to node 3 successfully']), conn)
  })

  node3.dialProtocol(node1.peerInfo, '/print', (err, conn) => {
  
    if (err) {
      console.log('node 3 failed to dial to node 1 with:', err.message)
    }
    pull(pull.values(['node 3 dialed to node 1 successfully']), conn)
  })
})