var _ = require('lodash');
var jwtdecode = require('jwt-decode');

var CMD = require('../lib/cmd');

module.exports = function(options,callback){

  var cmd = new CMD();

  callback = cmd.ensureGoodCallback(callback);

  if (cmd.config.settings.auth_token)
    cmd.dumpObject(jwtdecode(cmd.config.settings.auth_token));
  else
    cmd.logger.error('no current user');

  callback(null);
};