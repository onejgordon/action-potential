var Rebase = require('re-base');

var base = Rebase.createClass({
      apiKey: "",
      authDomain: "[app]l.firebaseapp.com",
      databaseURL: "https://[app].firebaseio.com",
      storageBucket: "[app].appspot.com",
}, 'action-potential-app');

module.exports = base;