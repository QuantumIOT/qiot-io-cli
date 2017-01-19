var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(options,callback){

  var cmd = new CMD();
  var host = new HOST(true);

  callback = cmd.ensureGoodCallback(callback);

  host.get('/users/accounts').then(function(result){

    if (result.statusCode !== host.allCodes.OK || !result.data.accounts) return callback(host.allCodes.getStatusText(result.statusCode));

    cmd.dumpTable(['id','name','token_identifier','token_secret','account_token','users.0.id','users.0.email'],result.data.accounts);

    callback(null);

  },callback);
};