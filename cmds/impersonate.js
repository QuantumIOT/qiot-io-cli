var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(options,callback){
  var cmd = new CMD();
  var host = new HOST(true);

  callback = cmd.ensureGoodCallback(callback);

  if (!cmd.options.user) return callback('no user given');

  host.put('/users/users/' + cmd.options.user + '/impersonate').then(function(result){

    if (result.statusCode !== host.allCodes.OK || !result.data.token) return callback('unsuccessful impersonation: ' + host.allCodes.getStatusText(result.statusCode));

    cmd.config.update({user_token: result.data.token});

    callback(null);

  },callback);
};