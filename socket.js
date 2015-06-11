var side = ""
var WebSocket = require('ws')

var WebSocketServer = WebSocket.Server

var socket = {}
socket.createNew = function(name, server) {
  console.log('new ws')
  var wss = new WebSocketServer({ server: server })
  wss.on('connection', function connection(ws) {
    console.log('ws connected')
    ws.on('open', function open() {
      ws.send('new person has entered chat.', function error(err) {
        if (err) console.error(err)
      })
    })
    ws.on('message', function(data, flag) {
      console.log('msg : %s', data)
    })
  })
}


module.exports = socket