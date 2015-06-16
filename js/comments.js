var React = require('react')
var marked = require('marked')
var config = require('../node/config')
var levelup = require('level-browserify')
//define level db
var db = levelup(config.db)
db.createKeyStream()
  .on('data', function(key) {
    console.log(key)
  })
  .on('error', function(err) {
    console.error(err)
  })

var CommentBox = React.createClass({displayName: "CommentBox",
  loadCommentsFromServer: function() {
    var self = this
    db.createValueStream({ gte: 'comment_', lte: 'comment_\xff', valueEncoding: 'json' })
      .on('data', function(comment) {
        self.state.data.push(comment)
        self.setState({ data: self.state.data })
      })
      .on('error', function(err) {
        return console.error(err)
      })
      .on('end', function() { console.log('all done loading comments.') })
  },
  handleCommentSubmit: function(comment) {
    var self = this
    var date = new Date()
    var id = 'comment_'+Date.parse(date)+'_'+comment.author
    db.put(id.replace(/\s/g, ''), comment, {valueEncoding: 'json'}, function(err) {
      if (err) return console.error(err)
      // TODO: add client-side err handling
      var updatedComments = self.state.data.concat(comment)
      self.setState({ data: updatedComments })
    })
  },
  getInitialState: function() {
    return {data: []}
  },
  componentDidMount: function() {
    this.loadCommentsFromServer()
  },
  render: function() {
    return (
      React.createElement("div", {className: "comment-box"}, 
        React.createElement("h1", null, "Notes"), 
        React.createElement(CommentList, {data: this.state.data}), 
        React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit})
      )
    )
  }
})

var CommentList = React.createClass({displayName: "CommentList",
  render: function() {
    var commentNodes = this.props.data.map(function(comment, i) {
      var key = 'comment'+i
      return (
        React.createElement(Comment, {key: key, author: comment.author, text: comment.text})
      )
    })
    return (
      React.createElement("div", {className: "comment-list"}, 
        commentNodes
      )
    )
  }
})

var CommentForm = React.createClass({displayName: "CommentForm",
  handleSubmit: function(e) {
    e.preventDefault()
    //get form values
    var author = React.findDOMNode(this.refs.author).value.trim()
    var text = React.findDOMNode(this.refs.text).value.trim()
    //do nothing if empty, else send data
    if (!text || !author) return
    this.props.onCommentSubmit({ author: author, text:text })
    //clear form
    React.findDOMNode(this.refs.author).value = ''
    React.findDOMNode(this.refs.text).value = ''
    return
  },
  render: function() {
    return (
      React.createElement("form", {className: "comment-form", onSubmit: this.handleSubmit}, 
        React.createElement("label", {htmlFor: "comment-form-name"}, "Name:"), 
        React.createElement("input", {id: "comment-name", type: "text", placeholder: "your name", required: "true", ref: "author"}), 
        React.createElement("label", {htmlFor: "comment-form-text"}, "Note:"), 
        React.createElement("textarea", {id: "comment-form-text", required: "true", spellCheck: "true", ref: "text"}), 
        React.createElement("input", {type: "submit", value: "post"})
      )
    )
  }
})

var Comment = React.createClass({displayName: "Comment",
  render: function() {
    var rawMU = marked(this.props.text.toString(), {sanitize: true})
    return (
      React.createElement("div", {className: "comment"}, 
        React.createElement("p", {className: "author"}, this.props.author), 
        React.createElement("div", {className: "comment-text", dangerouslySetInnerHTML: { __html: rawMU}})
      )
    )
  }
})

React.render(
  React.createElement(CommentBox, {pollInterval: 2000}),
  document.getElementById('comments-container')
)