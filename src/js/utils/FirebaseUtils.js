var Firebase = require('firebase');
var AppConstants = require('../constants/AppConstants');

var firebaseUtils = {
  homeInstance: function(){
    return new Firebase(AppConstants.FIREBASE_HOST);
  },
  toArray: function(obj){
    var arr = [];
    for(var key in obj){
      arr.push(obj[key]);
    }
    return arr;
  }
};

module.exports = firebaseUtils;