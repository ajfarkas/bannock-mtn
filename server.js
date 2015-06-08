var http = require('http')
var fs = require('fs')
var mime = require('mime')
var config = require('./config')
var db = require('./leveldb')
var fetch = require('./fetchInfo')

db.checkForUpdate()
http.createServer(function(req, res) {
  write(res, req.url)
}).listen(config.port, config.ip)
console.log('server running on port '+config.port+'.')

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
  if (file == '/') 
    file = 'index.html'
  else if (file.match(/\.json/) ) {
    return callJSON(res)
  }
  else 
    file = file.replace('/', '')

  options = options || null
  fs.readFile(file, options, function(err, data) {
    if (err) return console.error(err)
    // serveFile(res, file, data)
    res.writeHead(200, {'Content-Type': mime.lookup(file)})
    res.write(data)
    res.end()
  })
}