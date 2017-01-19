var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(options,callback){
  var cmd = new CMD();
  var host = new HOST(true);

  callback = cmd.ensureGoodCallback(callback);

  if (!cmd.bestOption(cmd.ACCOUNT_OPTION)) return callback('no account given');

  host.get('/users/accounts/' + cmd.options[cmd.ACCOUNT_OPTION] + '/collections').then(function(result){

    if (result.statusCode !== host.allCodes.OK || !result.data.collections) return callback(host.allCodes.getStatusText(result.statusCode));

    cmd.dumpTable(['id','name','auth_token'],result.data.collections); // TODO - auth_token => collection_token

    cmd.checkSaveClear(cmd.ACCOUNT_OPTION);

    callback(null);

  },callback);
};