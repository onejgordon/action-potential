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
import {FontIcon, RaisedButton, FlatButton} from 'material-ui';
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

  signin_dialog() {
    base.authWithOAuthPopup('google', (error, user_data) => {
      if (user_data) this.props.router.push(`/app/main`);
      else if (error) console.log(error);
    });
  }

  render() {
    var {user} = this.props;
    var cta;
    if (user) {
      cta = (
        <div>
          <p>You are signed in. Go to <Link to={`/app/main`}><RaisedButton label="My Decisions" /></Link></p>
        </div>
      );
    } else {
      cta = <div>
        <p>Try it!</p>
        <RaisedButton primary={true} label="Sign In" onClick={this.signin_dialog.bind(this)} />
      </div>
    }
    return (
      <div className="container">

        <div className="text-center">

          <div className="row">
            <div className="col-sm-6">
              <img src="/images/actionpotential_512.png" className="img img-responsive" />
            </div>
            <div className="col-sm-6">
              <p className="lead" style={{fontSize: "3em"}}>{ AppConstants.DESCRIPTION }</p>
              <div style={{color: "gray", fontSize: "1.6em"}}>
                { cta }

                <small>Built with <a href="https://firebase.google.com" target="_blank">Firebase</a>, <a href="https://github.com/tylermcginnis/re-base" target="_blank">Re-base</a>, and <a href="https://facebook.github.io/react/">React.js</a>. See source on <a href="https://github.com/onejgordon/action-potential" target="_blank">Github</a></small>
              </div>
            </div>
          </div>

        </div>

      </div>
    )
  }
};

module.exports = withRouter(Public);
