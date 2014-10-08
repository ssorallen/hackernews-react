/** @jsx React.DOM */

var HackerNews = React.createClass({
  mixins: [NestedFirebaseMixin],

  componentWillMount: function() {
    this.firebaseRoot = new Firebase("https://hacker-news.firebaseio.com/v0/topstories");
    this.firebaseRootListener = function(dataSnapshot) {
      var nextStoryIds = dataSnapshot.val();
      var nextStories = new Array(nextStoryIds.length);

      var firebaseRefs = nextStoryIds.map(function(id, index) {
        var url = "https://hacker-news.firebaseio.com/v0/item/" + id;
        var ref = new Firebase(url);

        ref.on("value", function(dataSnapshot) {
          nextStories[index] = dataSnapshot.val();
          this.forceUpdate();
        }.bind(this));
      }, this);

      this.setState({stories: nextStories});
    }.bind(this)

    this.firebaseRoot.on("value", this.firebaseRootListener);
  },

  componentWillUnmount: function() {
    this.firebaseRoot.off("value", this.firebaseRootListener);
  },  

  getInitialState: function() {
    return {
      stories: []
    };
  },

  render: function() {
    return (
      <div className="container">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h1 className="panel-title">Hacker News</h1>
          </div>
          <div className="panel-body">
            <ol className="story-list">
              {this.state.stories.map(function(story) {
                return <Story story={story} />;
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  }
});

function parseDomain(url) {
  var anchor = document.createElement("a");
  anchor.href = url;
  return anchor.hostname.split(".").slice(-2).join(".");
}

var Story = React.createClass({
  render: function() {
    var story = this.props.story;
    var storyMoment = moment(story.time * 1000);

    return (
      <li>
        <h4 className="story-heading">
          <a href={story.url}>{story.title}</a> <small>({parseDomain(story.url)})</small>
        </h4>
        <p className="text-muted">
          {story.score} points by { }
          <a className="text-muted" href={"https://news.ycombinator.com/user?id=" + story.by}>
            {story.by}
          </a> { }
          <time datetime={storyMoment.utc()} title={storyMoment.utc()}>
            {storyMoment.fromNow()}</time> | { }
          <a className="text-muted" href={"https://news.ycombinator.com/item?id=" + story.id}>comments</a>
        </p>
      </li>
    );
  }
});

React.renderComponent(HackerNews(), document.getElementById("main"));
