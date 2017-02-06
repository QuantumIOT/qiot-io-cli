var _ = require('lodash');

var CMD = require('../lib/cmd');

module.exports = function(){
  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);
  
  var object = {};
  if (cmd.config.settings.user_token)
    object = cmd.safeTokenDecode(cmd.config.settings.user_token) || {};
  else
    cmd.logger.error('no user token');
  
  object.current_user       = cmd.config.settings.current_user;
  object.current_account    = cmd.config.settings.current_account;
  object.current_collection = cmd.config.settings.current_collection;
  object.current_thing      = cmd.config.settings.current_thing;
  cmd.dumpObject(object);

  callback(null);
};