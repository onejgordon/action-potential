var React = require('react');

var FetchedList = require('components/FetchedList');
var mui = require('material-ui'),
  Dialog = mui.Dialog;

var DialogChooser = React.createClass({displayName: 'DialogChooser',
  getDefaultProps: function() {
    return {
      url: null,
      params: {},
      listProp: 'items',
      labelProp: 'label',
      onItemChosen: null,
      prompt: "",
      onRequestClose: null,
      open: false
    };
  },
  getInitialState: function() {
    return {
    };
  },
  componentWillReceiveProps: function(nextProps) {
  },
  componentDidUpdate: function(prevProps, prevState) {
  },
  componentDidMount: function() {
  },
  refresh: function() {
    this.refs.fl.refresh();
  },
  handleChoose: function(i) {
    if (this.props.onItemChosen) this.props.onItemChosen(i);
    if (this.props.onRequestClose) this.props.onRequestClose(i);
  },
  render: function() {
    var _content;
    if (this.props.open) _content = (
      <div>
        <p className="lead">{ this.props.prompt }</p>
        <FetchedList ref="fl" autofetch={true} url={this.props.url} params={this.props.params} listProp={this.props.listProp} labelProp={this.props.labelProp} onItemClick={this.handleChoose} />
      </div>
    );
    return (
      <Dialog title="Choose" open={this.props.open} onRequestClose={this.props.onRequestClose.bind(this)} autoScrollBodyContent={true} autoDetectWindowHeight={true} >
       {_content}
      </Dialog>
    );
  }
});

module.exports = DialogChooser;