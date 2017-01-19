var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(){
  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  if (cmd.requireOptions(cmd.ACCOUNT_OPTION,callback)) return;

  host.get('/users/accounts/' + cmd.options[cmd.ACCOUNT_OPTION] + '/collections').then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK || !result.data.collections) return callback(HOST.allCodes.getStatusText(result.statusCode));

      cmd.dumpTable(['id', 'name', 'auth_token'], result.data.collections); // TODO - auth_token => collection_token

      cmd.checkSaveClear(cmd.ACCOUNT_OPTION);

      callback(null);
    });
  },callback);
};