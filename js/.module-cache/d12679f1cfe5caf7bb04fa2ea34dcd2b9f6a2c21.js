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

react.render(
  react.createElement(CommentBox, null),
  document.getElementById('comments-container')
)