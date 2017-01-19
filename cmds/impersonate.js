var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(){
  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  if (!cmd.options.user) return callback('no user given');

  host.put('/users/users/' + cmd.options.user + '/impersonate').then(function(result){
    cmd.safeguard(callback,function(){
      if (result.statusCode !== host.allCodes.OK || !result.data.token) return callback('unsuccessful impersonation: ' + host.allCodes.getStatusText(result.statusCode));

      cmd.establishUser(result.data.token);

      callback(null);
    });
  },callback);
};