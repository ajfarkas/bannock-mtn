var env = process.env.NODE_ENV || 'development'

var config = {
  development: {
    port: 8008,
    ip: '127.0.0.1',
    db: {
      weather: './db/weatherdb',
      notes: './db/notesdb'
    },
    token: '9f206693050a1722',
    prettyHtml: true
  },
  production: {
    port: process.env.OPENSHIFT_NODEJS_PORT || 9000,
    ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1:9000',
    db: {
      weather: './db/weatherdb',
      notes: './db/notesdb'
    },
    token: process.env.WU_TOKEN,
    prettyHtml: false
  }
}

module.exports = config[env]