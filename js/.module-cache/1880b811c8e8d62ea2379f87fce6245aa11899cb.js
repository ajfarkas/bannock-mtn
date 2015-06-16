var react = require('react')

var CommentBox = react.createClass({
  render: function() {
    return (
      React.createElement("div", {className: "comment-box"}, 
        React.createElement("p", null, "I am Box!")
      )
    )
  }
})

var CommentList = react.createClass({
  render: function() {
    return (
      React.createElement("div", {className: "comment-list"}, 
        React.createElement("p", null, "I am Comment List!")
      )
    )
  }
})

var CommentForm = react.createClass({
  render: function() {
    return (
      React.createElement("div", {className: "comment-form"}, 
        React.createElement("p", null, "I am a form!")
      )
    )
  }
})

react.render(
  react.createElement(CommentBox, null),
  document.getElementById('comments-container')
)