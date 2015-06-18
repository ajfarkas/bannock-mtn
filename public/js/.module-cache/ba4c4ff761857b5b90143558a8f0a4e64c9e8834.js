var marked = require('marked')
var socket = io()

var notesSect = d3.select('#notes-container'),
    notes = notesSect.select('.notes-box'),
    btn = notesSect.select('input[type=submit'),
    textarea = d3.select('#notes-container').select('textarea'),
    textLen = 0

//dynamically resize textarea
textarea.on('input', function() {
  var node = textarea.node() 
  if (node.scrollHeight > 13) {
    if (node.textLength < textLen) {
      textarea.style('height', '13px')
    }
    textarea.style('height', node.scrollHeight+'px')
  }
  textLen = node.textLength
})

// send form info to socket server as json 
btn.on('click', function() {
  d3.event.preventDefault()
  var name = d3.select('#note-name').node(),
      msg = d3.select('#note-msg').node(),
      date = new Date()
      note = {
        name: name.value,
        note: msg.value,
        date: (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()
      }
  //send to server
  socket.emit('new note', note)
  //immediately post to this page
  addNote(note)
  // clear form
  name.value = ''
  msg.value = ''
})

//insert note into list
function addNote(note) {
  markup = marked(note.note.toString(), {sanitize: true})
  var p = notes.insert('div', '.note')
    .attr('class', 'note')
  p.append('p')
    .attr('class', 'date')
    .text(note.date)
  p.append('p')
    .attr('class', 'name')
    .text(note.name)
  p.append('p')
    .attr('class', 'note-text')
    .html(markup)
}

socket.on('connect', function() {
  d3.select('.load-msg').text('')
})

socket.on('no notes', function(msg) {
  d3.select('.load-msg').text(msg)
})

socket.on('new note', function(note) { addNote(note) })

socket.on('db get err', function() {
  d3.select('.load-msg')
    .text('Error loading notes from server.')
})
socket.on('db put err', function() {
  alert('Error writing to server. Please copy the text of your note and try again.')
})
socket.on('disconnect', function() {
  // alert('Disconnected from server. Please reload this page.')
})