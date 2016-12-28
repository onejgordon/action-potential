'use strict';

var React = require('react');
var Router = require('react-router');
var util = require('utils/util');
var $ = require('jquery');
var bootstrap = require('bootstrap');
var toastr = require('toastr');
import {
  blue400, blue700, blue900, blueA400,
  white
} from 'material-ui/styles/colors';

var mui = require('material-ui'),
  FlatButton = mui.FlatButton,
  RaisedButton = mui.RaisedButton,
  IconButton = mui.IconButton,
  IconMenu = mui.IconMenu,
  Avatar = mui.Avatar,
  FontIcon = mui.FontIcon,
  MenuItem = mui.MenuItem;

var AppConstants = require('constants/AppConstants');
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

import connectToStores from 'alt-utils/lib/connectToStores';
import {authDecorator} from 'utils/component-utils';
import { browserHistory } from 'react-router';

@authDecorator
export default class App extends React.Component {

  static defaultProps = { user: null };
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    var tz = this.props.user ? this.props.user.timezone : "Africa/Nairobi";
    util.startAutomaticTimestamps(tz, 5);
    // $('link[title=app_css]').prop('disabled',false);
  }

  componentWillUnmount() {
    // $('link[title=app_css]').prop('disabled',true);
    // TODO: Remove automatic timestamps
  }

  toggle_search(open) {
    this.setState({search_open: open});
  }

  menuSelect(menu, e, value) {
    if (value == "logout" && menu == "user") UserActions.logout();
    else browserHistory.push(value);
  }

  render() {
    var {user, wide} = this.props;
    var is_admin = user ? user.level == AppConstants.USER_ADMIN : false;
    var can_write = user ? user.level > AppConstants.USER_READ : false;
    return (
      <div>

        <div id="container" className="container">
          <div className="app-content row">
            {React.cloneElement(this.props.children, {
              user: user
            })}
          </div>
        </div>

      </div>
    )
  }
}