var proxyutils = require('../lib/proxy-utils');

module.exports = function(thing_token){
  return proxyutils.request(arguments,{path: '/1/l/' + thing_token},null,function(cmd,result,callback){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== proxyutils.HOST.allCodes.OK) return callback(proxyutils.HOST.allCodes.getStatusText(result.statusCode));

      cmd.dumpObject(result.data);

      callback(null);
    });
  });
};