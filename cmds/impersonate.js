var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(userid){
  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  var endpoint = userid ? '/users/users/' + userid + '/impersonate' : '/users/users/reload';

  host.put(endpoint).then(function(result){
    cmd.safeguard(callback,function(){
      if (result.statusCode !== HOST.allCodes.OK || !result.data.token) return callback('unsuccessful impersonation: ' + HOST.describeResult(result));

      cmd.establishUser(result.data.token);

      callback(null);
    });
  },callback);
};