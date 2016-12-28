'use strict';

var React = require('react');
var Router = require('react-router');
var mui = require('material-ui');
var UserStore = require('stores/UserStore');
var UserActions = require('actions/UserActions');
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
class Root extends React.Component {
  constructor(props) {
    super(props);
    // UserActions.loadSession();
  }

  static getStores() {
    return [UserStore];
  }

  static getPropsFromStores() {
    var st = UserStore.getState();
    return st;
  }

  componentDidMount() {
    if (this.props.user == null) {
      this.props.history.replaceState(null, '/public');
    } else {
      this.props.history.replaceState(null, '/app');
    }
  }

  render() {
    return (
        <div>
          {this.props.children}
        </div>
    )
  }
};

module.exports = Root;
