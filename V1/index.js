
'use strict'

const PeerInfo = require('peer-info')
const waterfall = require('async/waterfall')
const t2t = require('./DMessangerCore')
const readline = require('readline');
const pull = require('pull-stream');

let node

function createNode(callback){
  waterfall([
    (cb) => PeerInfo.create(cb),
    (peerInfo, cb) => {
      peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
      node = new t2t({ peerInfo: peerInfo })
      node.start(cb)
    }
  ], (err) => {
    if (err) { throw err }
    console.log('node has started (true/false):', node.isStarted())
    console.log('listening on:')
    node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))
    callback(node);
  })
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

createNode((node) => {
  node.handle('/print', (protocol, conn) => {
    pull(
      conn,
      pull.map((v) => v.toString()),
      pull.log()
    )
  });
  rl.question('send message to address: ', (address) => {
    node.dialProtocol(address, '/print', (err, conn) => {
      if (err) { throw err }

      pull(pull.values(['HelloFromTheOtherSide']), conn);
      rl.close();
    })
  });
});