var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(options,callback){
  var cmd = new CMD();
  var host = new HOST(true);

  callback = cmd.ensureGoodCallback(callback);

  host.get('/users/things').then(function(result){

    if (result.statusCode !== host.allCodes.OK || !result.data.things) return callback(host.allCodes.getStatusText(result.statusCode));

    cmd.dumpTable(['id','label','auth_token','collection_id','last_reported_at','identities.0.type','identities.0.value'],result.data.things);

    callback(null);

  },callback);
};