var React = require('react');

class SaveStatus extends React.Component {
  render() {
    if (this.props.visible) {
      var text = this.props.saved ? "Saved" : "Unsaved";
      var cls = this.props.saved ? "saved label-success" : "unsaved label-warning";
      var icon = this.props.saved ? <i className="fa fa-check"></i> : <i></i>;
      return (
        <div className={"saveStatus label "+cls}>
          <span className='message'>{icon} { text }</span>
        </div>
      );
    } else return <div></div>
  }
}

SaveStatus.defaultProps = {
  visible: false,
  saved: true
};

SaveStatus.displayName = 'SaveStatus';

module.exports = SaveStatus;
