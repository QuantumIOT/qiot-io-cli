var API     = require('../lib/api');

module.exports = function(thingToken,options){
  if (thingToken && options.socket) return require('./socket')('messages','thingToListen',thingToken);

  if (thingToken) require('commander').thing_token = thingToken;

  return API.executeDefn(arguments,API.findDefn({command: 'messages'}));
};
