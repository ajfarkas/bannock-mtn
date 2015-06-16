var CommentBox = React.createClass({displayName: "CommentBox",
  render: function() {
    return (
      React.createElement("div", {className: "comment-box"}, 
        React.createElement("p", null, "I am Box!")
      )
    )
  }
})

var CommentList = React.createClass({displayName: "CommentList",
  render: function() {
    return (
      React.createElement("div", {className: "comment-list"}, 
        React.createElement("p", null, "I am Comment List!")
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

React.render(
  React.createElement(CommentBox, null),
  document.getElementById('comments-container')
)