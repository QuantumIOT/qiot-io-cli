var API = require('../lib/api');

module.exports = function(thing_token,message){
  var commander = require('commander');

  commander.thing_token = thing_token;

  var pattern = {command: 'mailbox',required_options: ['thing_token']};

  if (message) {
    commander.body = message;
    pattern.body = true;
  }

  return API.executeDefn(arguments,API.findDefn(pattern));
};
