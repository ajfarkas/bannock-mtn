var socket = {}

socket.createNew = function(){
  var protocol = window.location.protocol == 'https:' ? 'wss' : 'ws'
  socket.ws = new WebSocket(protocol+'://'+window.location.host)

  socket.ws.onerror = function(err) {
    console.error(err)
  }
  socket.ws.onopen = function(e) {
    socket.ws.send('client-side connection open!')
  }
  socket.ws.onmessage = function(e) {
    console.log(e.data)
  }
}

module.exports = socket