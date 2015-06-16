var React = require('react')
var marked = require('marked')

var CommentBox = React.createClass({displayName: "CommentBox",
  loadCommentsFromServer: function() {
    var self = this
    d3.json(this.props.url, function(err, comments) {
      if (err) return console.error(err)
      self.setState({ data: comments })
    })
  },
  getInitialState: function() {
    return {data: []}
  },
  componentDidMount: function() {
    this.loadCommentsFromServer(),
    setInterval(this.loadCommentsFromServer, this.props.pollInterval)
  },
  render: function() {
    return (
      React.createElement("div", {className: "comment-box"}, 
        React.createElement("h1", null, "Notes"), 
        React.createElement(CommentList, {data: this.state.data}), 
        React.createElement(CommentForm, null)
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
  render: function() {
    return (
      React.createElement("form", {className: "comment-form"}, 
        React.createElement("label", {for: "comment-form-name"}, "Name:"), 
        React.createElement("input", {id: "comment-name", type: "text", placeholder: "your name", required: "true"}), 
        React.createElement("label", {for: "comment-form-text"}, "Note:"), 
        React.createElement("textarea", {id: "comment-form-text", required: "true", spellcheck: "true"}), 
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
  React.createElement(CommentBox, {url: "js/comments.json", pollInterval: 2000}),
  document.getElementById('comments-container')
)