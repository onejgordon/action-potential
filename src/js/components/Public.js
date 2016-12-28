var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
import { withRouter } from 'react-router'
var util = require('utils/util');

var bootstrap = require('bootstrap');
var AppConstants = require('constants/AppConstants');
var toastr = require('toastr');
import history from 'config/history'
var $ = require('jquery');

var mui = require('material-ui'),
  FontIcon = mui.FontIcon,
  RaisedButton = mui.RaisedButton,
  FlatButton = mui.FlatButton;

var UserActions = require('actions/UserActions');
var UserStore = require('stores/UserStore');
var AppConstants = require('constants/AppConstants');

import connectToStores from 'alt-utils/lib/connectToStores';
import {changeHandler} from 'utils/component-utils';

var Rebase = require('re-base');
var base = Rebase.createClass({
      apiKey: "AIzaSyASFn2mDGbmRYbgk36SNJNME5qe8HLLf4w",
      authDomain: "action-potential.firebaseapp.com",
      databaseURL: "https://action-potential.firebaseio.com",
      storageBucket: "action-potential.appspot.com",
}, 'action-potential-app');


@changeHandler
class Public extends React.Component {
  static defaultProps = {
    user: null
  }
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }


  handle_toggle_leftnav = () => this.setState({ln_open: !this.state.ln_open});

  handle_leftnav_change = (open) => this.setState({ln_open: open});

  goto_page(link) {
    window.location = link;
  }

  navigate_to_page(page) {
    this.props.router.push(page);
  }

  render() {
    var {user} = this.props;
    var cta;
    if (user) {
      cta = <Link to={`/app/main`}><button className="btn btn-default">My Decisions</button></Link>
    } else {
      cta = <p>Sign in to try it.</p>
    }
    return (
      <div className="container">

          <div className="text-center">

            <FontIcon className="material-icons" style={{width: "400px", height: "200px", fontSize: "12em"}}>wb_incandescent</FontIcon>

            <p className="lead" style={{fontSize: "3em"}}>{ AppConstants.DESCRIPTION }</p>

            <div style={{color: "gray", fontSize: "1.6em"}}>

              { cta }

            </div>

          </div>

          <div className="text-center" style={{marginTop: "15px"}}>



          </div>

      </div>
    )
  }
};

module.exports = withRouter(Public);
