var API = require('../lib/api');
var CMD = require('../lib/cmd');

module.exports = function(thingToken,options){
  var cmd = new CMD();

  thingToken = cmd.bestThingToken(thingToken);

  if (thingToken && options.socket) return require('./socket')('messages','thingToListen',thingToken);

  if (thingToken) require('commander').thing_token = thingToken;

  return API.executeDefn(arguments,API.findDefn({command: 'messages'}));
};
