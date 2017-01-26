var _ = require('lodash');

var CMD     = require('../lib/cmd');
var API     = require('../lib/api');

module.exports = function(options){
  var cmd = new CMD();

  if (options.socket && cmd.bestOption(CMD.ACCOUNT_OPTION)) return require('./socket')('users','listenAccountThingsChannel',cmd.options.account);

  var collectionPattern = {command: 'things',required_options: [CMD.COLLECTION_OPTION]};
  var accountPattern    = {command: 'things',required_options: [CMD.ACCOUNT_OPTION]};

  return API.executeDefn(arguments,
    cmd.options[CMD.COLLECTION_OPTION]    ? API.findDefn(collectionPattern) :
    cmd.options[CMD.ACCOUNT_OPTION]       ? API.findDefn(accountPattern) :
    cmd.bestOption(CMD.COLLECTION_OPTION) ? API.findDefn(collectionPattern) :
    cmd.bestOption(CMD.ACCOUNT_OPTION)    ? API.findDefn(accountPattern) :
    {error: 'no collection or account found'}
  );
};
