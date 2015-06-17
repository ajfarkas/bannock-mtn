var WebSocket = require('socket.io')

var socket = {}

socket.createNew = function(server) {
  var io = WebSocket(server)
  console.log('new ws')

  io.on('connection', function connection(client) {
    console.log('user connected')

    client.on('new note', function(note) {
      client.broadcast.emit('new note', note)
    })
    client.on('disconnect', function disconnect() {
      console.log('user disconnected.')
    })
  })
  io.on('error', function error(err) {
    console.error(err)
  })
}

module.exports = socket
