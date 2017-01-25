var API = require('../lib/api');

module.exports = function(thingToken){
  var pattern = {command: 'messages'};

  if (thingToken) require('commander').thing_token = thingToken;

  return API.executeDefn(arguments,API.findDefn(pattern));
};
