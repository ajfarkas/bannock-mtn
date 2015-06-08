var env = process.env.NODE_ENV || 'development'

var config = {
  development: {
    port: 8001,
    ip: '127.0.0.1',
    db: './weatherdb',
    prettyHtml: true
  },
  production: {
    port: process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    db: 'weatherdb',
    prettyHtml: false
  }
}

module.exports = config[env]