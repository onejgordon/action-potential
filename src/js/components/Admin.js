var React = require('react');
var Router = require('react-router');

var util = require('../utils/util');

var bootstrap = require('bootstrap');
var toastr = require('toastr');

var RouteHandler = Router.RouteHandler;

var Admin = React.createClass({
  getDefaultProps: function() {
    return {
    }
  },
  componentDidMount: function() {

  },
  render: function(){
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
});

module.exports = Admin;
