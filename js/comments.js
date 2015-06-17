var marked = require('marked')
var socket = io()

var notesSect = d3.select('#notes-container'),
    notes = notesSect.select('.notes-box'),
    btn = notesSect.select('button')
    

btn.on('click', function() {
  d3.event.preventDefault()
  var name = d3.select('#note-name').node(),
      msg = d3.select('#note-msg').node(),
      note = {
        name: name.value,
        note: msg.value
      }

  socket.emit('new note', note)
  name.value = ''
  msg.value = ''
})

socket.on('new note', function(note) {
  console.log('note received: '+ note)
  var p = notes.insert('p', '.note')
    .attr('class', 'note')
  p.insert('span', ':first-child')
    .attr('class', 'name')
    .text(note.name)
  p.html(p.html()+note.note)
})