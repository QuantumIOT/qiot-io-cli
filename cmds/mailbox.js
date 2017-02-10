var API = require('../lib/api');
var CMD = require('../lib/cmd');

module.exports = function(thingToken,message,options){
  var cmd = new CMD();

  cmd.options.thing_token = cmd.bestThingToken(thingToken);

  var pattern = {command: 'mailbox',required_options: ['thing_token']};

  if (pattern.body = !!(message || options.nobody)) cmd.options.body = message;

  return API.executeDefn(arguments,API.findDefn(pattern));
};
