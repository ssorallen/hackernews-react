/** @jsx React.DOM */

var HackerNews = React.createClass({
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
      <div className="container">
        <div className="panel panel-default">
          <div className="panel-heading">
            <div className="pull-right">
              <a href="https://github.com/ssorallen/hackernews-react">
                GitHub Project
              </a>
            </div>
            <h1 className="panel-title">Hacker News</h1>
          </div>
          <div className="panel-body">
            <ol className="story-list">
              {this.state.storyIds.map(function(storyId) {
                return this.state["story" + storyId] == null ?
                  null :
                  <Story key={storyId} story={this.state["story" + storyId]} />;
              }, this)}
            </ol>
          </div>
        </div>
        <footer>
          <p className="text-muted">
            Created by <a href="https://twitter.com/ssorallen">@ssorallen</a>
          </p>
        </footer>
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

    var url, urlNode;
    if (story.type === "job" || story.type === "poll" || story.url === "") {
      url = "https://news.ycombinator.com/item?id=" + story.id;
    } else if (story.url != null) {
      url = story.url;
      urlNode = <small>({parseDomain(url)})</small>;
    }

    return (
      <li>
        <h4 className="story-heading">
          <a href={url}>{story.title}</a> {urlNode}
        </h4>
        <p className="text-muted">
          {story.score} points by { }
          <a className="text-muted" href={"https://news.ycombinator.com/user?id=" + story.by}>
            {story.by}
          </a> { }
          <time dateTime={storyMoment.utc()} title={storyMoment.utc()}>
            {storyMoment.fromNow()}</time> | { }
          <a className="text-muted" href={"https://news.ycombinator.com/item?id=" + story.id}>comments</a>
        </p>
      </li>
    );
  }
});

React.renderComponent(HackerNews(), document.getElementById("main"));
