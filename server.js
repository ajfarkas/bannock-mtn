var http = require('http')
var fs = require('fs')
var mime = require('mime')

var config = require('./node/config')
var db = require('./node/leveldb')
var fetch = require('./node/fetchInfo')
var socket = require('./node/socket')

//initialize server
var server = http.createServer(function(req, res) {
  //serve views
  write(res, req.url)
}).listen(config.port)
console.log('server running on port '+config.port+'.')
//create new websocket
socket.createNew(server)
    
function callJSON(res) {
  var waitForData = setInterval(function() {
    console.log('waiting...')
    if (fetch.data) {
      clearInterval(waitForData)
      console.log('results to server')
      res.write(JSON.stringify(fetch.data))
      res.end()
    }
  }, 100)
}

function write(res, file, options) {
  if (file == '/') {
    file = 'index.html'
    //update db
    db.checkForUpdate()
  }
  else if (file.match('bannock_weather.json') ) {
    return callJSON(res)
  }
  else 
    file = file.replace('/', '')

  options = options || null
  fs.readFile(file, options, function(err, data) {
    if (err) return console.error(err)
    res.writeHead(200, {'Content-Type': mime.lookup(file)})
    res.write(data)
    res.end()
  })
}