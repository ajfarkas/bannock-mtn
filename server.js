var http = require('http')

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.write('<h1>Success! Finally!</h1>')
  res.end()
}).listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP)
console.log('server running on port '+config.port+'.')
