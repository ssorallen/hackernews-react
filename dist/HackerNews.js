/** @jsx React.DOM */

var HackerNews = React.createClass({displayName: 'HackerNews',
  mixins: [ReactFireMixin],

  componentWillMount: function() {
    this.firebaseRoot = new Firebase("https://hacker-news.firebaseio.com/v0/topstories");
    this.firebaseRootListener = function(dataSnapshot) {
      var nextStoryIds = dataSnapshot.val();
      var prevStoryIds = this.state.storyIds.slice();

      // Bind to any new stories
      nextStoryIds.forEach(function(storyId) {
        var index = prevStoryIds.indexOf(storyId);
        if (index < 0) {
          this.bindAsObject(
            new Firebase("https://hacker-news.firebaseio.com/v0/item/" + storyId),
            "story" + storyId
          );
        }

        prevStoryIds.splice(index, 1);
      }, this);

      // Unbind any stories that are not in the new list
      prevStoryIds.forEach(function(storyId) {
        this.unbind("story" + storyId);
      }, this)

      this.setState({storyIds: nextStoryIds});
    }.bind(this)

    this.firebaseRoot.on("value", this.firebaseRootListener);
  },

  componentWillUnmount: function() {
    this.firebaseRoot.off("value", this.firebaseRootListener);
  },

  getInitialState: function() {
    return {
      storyIds: []
    };
  },

  render: function() {
    return (
      React.DOM.div({className: "container"}, 
        React.DOM.div({className: "panel panel-default"}, 
          React.DOM.div({className: "panel-heading"}, 
            React.DOM.div({className: "pull-right"}, 
              React.DOM.a({href: "https://github.com/ssorallen/hackernews-react"}, 
                "GitHub Project"
              )
            ), 
            React.DOM.h1({className: "panel-title"}, "Hacker News")
          ), 
          React.DOM.div({className: "panel-body"}, 
            React.DOM.ol({className: "story-list"}, 
              this.state.storyIds.map(function(storyId) {
                return this.state["story" + storyId] == null ?
                  null :
                  Story({key: storyId, story: this.state["story" + storyId]});
              }, this)
            )
          )
        ), 
        React.DOM.footer(null, 
          React.DOM.p({className: "text-muted"}, 
            "Created by ", React.DOM.a({href: "https://twitter.com/ssorallen"}, "@ssorallen")
          )
        )
      )
    );
  }
});

function parseDomain(url) {
  var anchor = document.createElement("a");
  anchor.href = url;
  return anchor.hostname.split(".").slice(-2).join(".");
}

var Story = React.createClass({displayName: 'Story',
  render: function() {
    var story = this.props.story;
    var storyMoment = moment(story.time * 1000);

    var url, urlNode;
    if (story.type === "job" || story.type === "poll" || story.url === "") {
      url = "https://news.ycombinator.com/item?id=" + story.id;
    } else if (story.url != null) {
      url = story.url;
      urlNode = React.DOM.small(null, "(", parseDomain(url), ")");
    }

    return (
      React.DOM.li(null, 
        React.DOM.h4({className: "story-heading"}, 
          React.DOM.a({href: url}, story.title), " ", urlNode
        ), 
        React.DOM.p({className: "text-muted"}, 
          story.score, " points by ", 
          React.DOM.a({className: "text-muted", href: "https://news.ycombinator.com/user?id=" + story.by}, 
            story.by
          ), " ", 
          React.DOM.time({datetime: storyMoment.utc(), title: storyMoment.utc()}, 
            storyMoment.fromNow()), " | ", 
          React.DOM.a({className: "text-muted", href: "https://news.ycombinator.com/item?id=" + story.id}, "comments")
        )
      )
    );
  }
});

React.renderComponent(HackerNews(), document.getElementById("main"));
