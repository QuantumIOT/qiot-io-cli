var API = require('../lib/api');
var CMD = require('../lib/cmd');

module.exports = function(thingToken,message){
  var cmd = new CMD();

  cmd.options.thing_token = cmd.bestThingToken(thingToken);

  var pattern = {command: 'mailbox',required_options: ['thing_token']};

  if (message) {
    cmd.options.body = message;
    pattern.body = true;
  }

  return API.executeDefn(arguments,API.findDefn(pattern));
};
