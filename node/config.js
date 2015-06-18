var env = process.env.NODE_ENV || 'development'

var config = {
  development: {
    host: 8008,
    ip: '127.0.0.1',
    db: {
      weather: './db/weatherdb',
      notes: './db/notesdb'
    },
    token: '9f206693050a1722',
    prettyHtml: true
  },
  production: {
    port: process.env.OPENSHIFT_NODEJS_PORT || 8080,
    host: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    db: {
      weather: './db/weatherdb',
      notes: './db/notesdb'
    },
    token: process.env.WU_TOKEN,
    prettyHtml: false
  }
}

module.exports = config[env]