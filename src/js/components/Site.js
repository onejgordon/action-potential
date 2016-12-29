'use strict';

var React = require('react');
var Router = require('react-router');
import { withRouter } from 'react-router'
var Link = Router.Link;
var alt = require('config/alt');
var AppConstants = require('constants/AppConstants');
var toastr = require('toastr');
import {Avatar, IconMenu, MenuItem,
  FontIcon, RaisedButton, IconButton} from 'material-ui';
var Gravatar = require('react-gravatar');
var RouteHandler = Router.RouteHandler;
import { supplyFluxContext } from 'alt-react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {fade} from 'material-ui/utils/colorManipulator';
import {
  blue400, blue700, blue900, blueA400,
  lightBlack, darkBlack,
  grey100, grey500, grey300,
  white
} from 'material-ui/styles/colors';

var base = require('config/base');

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: blue400,
    primary2Color: blue900,
    primary3Color: lightBlack,
    accent1Color: blueA400,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3)
  }
});


class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    }
  }

  componentDidMount() {
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = "toast-bottom-left";

    base.onAuth((user) => {
      console.log("Authenticated...");
      this.setState({user: user});
    })
  }

  signout() {
    base.unauth();
    this.props.router.push(`/app`);
  }

  home() {
    this.props.router.push(`/app/main`);
  }

  render() {
    var YEAR = new Date().getFullYear();
    var copyright_years = AppConstants.YEAR;
    var {user} = this.state;
    var SITENAME = AppConstants.SITENAME;
    var _user_section;
    if (user != null) {
      var user_string = user.name || user.email || "User";
      var user_letter = user_string[0];
      var _avatar = (
        <IconButton>
            <Avatar
              color={white}
              backgroundColor={blue400}
              size={30} style={{cursor:'pointer'}}>{user_letter.toUpperCase()}</Avatar>
        </IconButton>
      );
      _user_section = (
        <div className="userSection col-sm-3 col-sm-offset-3">
          <div className="userAvatar">
            <IconMenu iconButtonElement={ _avatar }>
              <MenuItem onClick={this.home.bind(this)} primaryText="Home" />
              <MenuItem onClick={this.signout.bind(this)} primaryText={`Sign Out (${user_string})`} />
            </IconMenu>
          </div>
        </div>
        )
    }
    if (YEAR != AppConstants.YEAR) copyright_years = copyright_years + " - " + YEAR;
    return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>

            <div className="container">
              <header className="topBar row">
                <div className="siteHeader col-sm-6">
                  <div>
                    <Link to="/app"><h1 className="siteTitle"><img src="/images/actionpotential_48.png" /> { SITENAME }</h1></Link>
                  </div>
                </div>
                { _user_section }

              </header>
            </div>

            <div>{React.cloneElement(this.props.children, {
              user: user
            })}</div>

            <div id="footer">
              &copy; { copyright_years } { AppConstants.COMPANY }<br/>
            </div>
          </div>
        </MuiThemeProvider>
    )
  }
};

// Important!
Site.childContextTypes = {
  muiTheme: React.PropTypes.object
};

var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

export default withRouter(supplyFluxContext(alt)(Site))
