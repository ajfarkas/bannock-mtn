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
    host: 
      process.env.OPENSHIFT_NODEJS_IP+":"+process.env.OPENSHIFT_NODEJS_PORT
      || '127.0.0.1:8080',
    db: {
      weather: './db/weatherdb',
      notes: './db/notesdb'
    },
    token: process.env.WU_TOKEN,
    prettyHtml: false
  }
}

module.exports = config[env]