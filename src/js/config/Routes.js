var React = require('react');

var Site = require('components/Site');
var App = require('components/App');
var Main = require('components/Main');
var Decision = require('components/Decision');
var Join = require('components/Join');
var Settings = require('components/Settings');
var About = require('components/About');
var Public = require('components/Public');
var Admin = require('components/Admin');

// Admin
var AdminUsers = require('components/AdminUsers');

var NotFound = require('components/NotFound');

var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var IndexRoute = Router.IndexRoute;
var IndexRedirect = Router.IndexRedirect;

module.exports = (
  <Route component={Site} path="/">
    <IndexRedirect to="/app" />
    <Route path="app" component={App}>
      <IndexRedirect to="/app/public" />
      <Route path="public" component={Public} />
      <Route path="main" component={Main} />
      <Route path="decision/:decisionId" component={Decision} />
      <Route path="join" component={Join} />
      <Route path="about" component={About} />
      <Route path="settings" component={Settings} />
      <Route path="admin" component={Admin}>
        <IndexRedirect to="/app/users" />
        <Route path="users" component={AdminUsers}/>
      </Route>
      <Route path="*" component={NotFound}/>
    </Route>

  </Route>
);