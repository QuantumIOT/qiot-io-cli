var _ = require('lodash');

var API = require('../lib/api');
var CMD = require('../lib/cmd');

module.exports = function(identity,options){
  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var error = null;
  var identities = identity.split(',').map(function(item){
    var parts = item.split(':');
    switch(parts.length){
      case 1:
        if (!options.label) options.label = item;
        return {type: 'SN',value: item};
      case 2:
        return {type: parts[0],value: parts[1]};
      default:
        return error = 'invalid identity: ' + item;
    }
  });

  if (error) return callback(error);

  if (!options.label) options.label = identities[0].type + '-' + identities[0].value;

  var message = {identity: identities,label: options.label};
  if (cmd.bestOption(CMD.COLLECTION_OPTION) && _.isNaN(+cmd.options.collection)) message.collection_token = cmd.options.collection;

  cmd.options.body = JSON.stringify(message);

  return API.executeDefn(arguments,API.findDefn({command: 'register',body: true}));
};
