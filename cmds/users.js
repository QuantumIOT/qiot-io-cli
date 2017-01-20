var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(){
  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  host.get('/users').then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK || !result.data.users) return callback(HOST.describeResult(result));

      cmd.dumpTable(['id','name','email','account_id','role.name','oauth_provider'], result.data.users);

      callback(null);
    });
  },callback);
};