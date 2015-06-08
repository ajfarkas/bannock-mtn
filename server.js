var http = require('http')

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.write('<h1>Success! Finally!</h1>')
  res.end()
}).listen(port, ip)
console.log('server running on port '+port+'.')
