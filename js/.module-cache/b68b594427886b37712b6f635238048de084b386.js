var marked = require('marked')

var CommentBox = React.createClass({displayName: "CommentBox",
  render: function() {
    return (
      React.createElement("div", {className: "comment-box"}, 
        React.createElement("h1", null, "Notes"), 
        React.createElement(CommentList, null), 
        React.createElement(CommentForm, null)
      )
    )
  }
})

var CommentList = React.createClass({displayName: "CommentList",
  render: function() {
    return (
      React.createElement("div", {className: "comment-list"}, 
        React.createElement(Comment, {author: "Neil Gaiman"}, "American Gods"), 
        React.createElement(Comment, {author: "Allie Brosh"}, "Hyperbole and a Half")
      )
    )
  }
})

var CommentForm = React.createClass({displayName: "CommentForm",
  render: function() {
    return (
      React.createElement("div", {className: "comment-form"}, 
        React.createElement("p", null, "I am a form!")
      )
    )
  }
})

var Comment = React.createClass({displayName: "Comment",
  render: function() {
    return (
      React.createElement("div", {className: "comment"}, 
        React.createElement("p", {className: "author"}, this.props.author), 
        React.createElement("p", {className: "comment"}, this.props.children)
      )
    )
  }
})

React.render(
  React.createElement(CommentBox, null),
  document.getElementById('comments-container')
)