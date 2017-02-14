var API = require('../lib/api');
var CMD = require('../lib/cmd');

module.exports = function(thingToken,options){
  var cmd = new CMD();

  thingToken = cmd.bestThingToken(thingToken);

  if (thingToken && options.socket) return require('./socket')('messages','thingToListen',thingToken);

  if (thingToken)     cmd.options.thing_token = thingToken;
  if (options.filter) cmd.options.filter      = options.filter.split(',');
  if (options.from)   cmd.options.time_from   = options.from;
  if (options.to)     cmd.options.time_to     = options.to;

  return API.executeDefn(arguments,API.findDefn({command: 'messages'}));
};
