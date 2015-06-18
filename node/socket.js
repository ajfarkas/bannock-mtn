var socketIO = require('socket.io')
var levelup = require('levelup')

var config = require('./config')
var db = levelup(config.db.notes)
var socket = {}

//create new socket with full functionality
socket.createNew = function(server) {
  var io = socketIO(server)
  console.log('new ws')

  io.on('connection', function connection(client) {
    console.log('user connected')
    var notes = 0
    //load notes stored in db.
    db.createValueStream({ 
      gte: 'comment_', 
      lte: 'comment_\xff', 
      valueEncoding: 'json' 
    })
      .on('error', function(err) {
        client.emit('db get err')
        console.error(err)
      })
      .on('data', function(note) {
        client.emit('new note', note)
        notes++
      })
      .on('end', function() {
        if (notes === 0)
          client.emit('no notes', 'Nothing brewing just yet.')
      })

    //when form info is submitted
    client.on('new note', function(note) {
      // emit new note with json data
      client.broadcast.emit('new note', note)
      // set unique note id and send to server db
      var date = new Date()
      var id = 'comment_'+Date.parse(date)+'_'+note.name
      db.put(id.replace(/\s/g, '-'), note, {valueEncoding: 'json'}, function(err) {
        if (err) {
          client.emit('db put err')
          return console.err(err)
        }
      })
    })
    client.on('disconnect', function disconnect() {
      console.log('user disconnected.')
    })
  })
  io.on('error', function error(err) {
    console.error(err)
  })
}

socket.deleteAllNotes = function() {
  db.createKeyStream()
    .on('error', function(err) { 
      if (err) console.error(err)
    })
    .on('data', function(key) {
      db.del(key, function(err) {
        if (err) console.error(err)
      })
    })
}

module.exports = socket
