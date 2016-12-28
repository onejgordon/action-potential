var React = require('react');

var LoadStatus = React.createClass({displayName: 'LoadStatus',
  getDefaultProps: function() {
    return {
      loading: false,
      empty: true,
      emptyMessage: "Nothing to show",
      loadingMessage: "Please wait..."
      };
  },
  getMessage: function() {
    if (this.props.loading) return this.props.loadingMessage;
    else if (this.props.empty) return this.props.emptyMessage;
    else return "--";
  },
  render: function() {
    var message = this.getMessage();
    var showNil = !this.props.loading && this.props.empty;
    var showLoadStatus = this.props.loading || this.props.empty;
    var showLoader = this.props.loading;
    var loader = (
        <span className='holder'>
          <span className="loader large"></span>
        </span>
      );
    var nil = (
      <span className="bigicon _100 nil"></span>
      );
    return showLoadStatus ? (
      <div className="loadStatus">
        { showLoader ? loader : "" }
        { showNil ? nil : "" }
        <span className='message'>{ message }</span>
      </div>
    ) : <div></div>;
  }
});

module.exports = LoadStatus;