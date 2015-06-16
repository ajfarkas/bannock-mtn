var marked = require('marked')

var data = [
  { author: "Neil Gaiman", 
    text: "Enter night, exit light"
  },
  { author: "Allie Brosh",
    text: "Hyperbolize _All The Things!_"
  }
]

var CommentBox = React.createClass({displayName: "CommentBox",
  render: function() {
    return (
      React.createElement("div", {className: "comment-box"}, 
        React.createElement("h1", null, "Notes"), 
        React.createElement(CommentList, {data: this.props.data}), 
        React.createElement(CommentForm, null)
      )
    )
  }
})

var CommentList = React.createClass({displayName: "CommentList",
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        React.createElement(Comment, {author: comment.author, text: comment.text})
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
      React.createElement("div", {className: "comment-form"})
    )
  }
})

var Comment = React.createClass({displayName: "Comment",
  render: function() {
    var rawMU = marked(this.props.text.toString(), {sanitize: true})
    return (
      React.createElement("div", {className: "comment"}, 
        React.createElement("p", {className: "author"}, this.props.author), 
        React.createElement("p", {className: "comment", dangerouslySetInnerHTML: { __html: rawMU}})
      )
    )
  }
})

React.render(
  React.createElement(CommentBox, {data: data}),
  document.getElementById('comments-container')
)