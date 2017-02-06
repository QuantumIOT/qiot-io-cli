var API = require('../lib/api');
var CMD = require('../lib/cmd');

module.exports = function(thingToken,message){
  var cmd = new CMD();

  cmd.options.thing_token = cmd.bestThingToken(thingToken);
  cmd.options.body        = message;

  return API.executeDefn(arguments,API.findDefn({command: 'log',body: true}));
};
