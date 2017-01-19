var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(method,uri,body){

  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  host.request({method: method, path: uri},cmd.helpers.safeParseJSON(body || null)).then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK) return callback(HOST.allCodes.getStatusText(result.statusCode));

      cmd.dumpObject(result.data);

      callback(null);
    });
  },callback);
};