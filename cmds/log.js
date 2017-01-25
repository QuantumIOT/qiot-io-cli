var API = require('../lib/api');

module.exports = function(thing_token,message){
  var commander = require('commander');
  commander.thing_token = thing_token;
  commander.body        = message;
  return API.executeDefn(arguments,API.findDefn({command: 'log',body: true}));
};
