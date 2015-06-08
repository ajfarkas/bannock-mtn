var env = process.env.NODE_ENV || 'development'

var config = {
  development: {
    port: 8001,
    db: './weatherdb',
    prettyHtml: true
  },
  production: {
    port: process.env.PORT || 5000,
    db: 'weatherdb',
    prettyHtml: false
  }
}

module.exports = config[env]