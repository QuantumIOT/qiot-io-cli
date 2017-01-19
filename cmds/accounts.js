var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(){

  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  host.get('/users/accounts').then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== host.allCodes.OK || !result.data.accounts) return callback(host.allCodes.getStatusText(result.statusCode));

      cmd.dumpTable(['id', 'name', 'token_identifier', 'token_secret', 'account_token', 'users.0.id', 'users.0.email'], result.data.accounts);

      callback(null);
    });
  },callback);
};