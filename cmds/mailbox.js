var proxyutils = require('../lib/proxy-utils');

module.exports = function(thing_token,message){
  if (message) return proxyutils.post(arguments,'/1/m/' + thing_token,message);

  return proxyutils.request(arguments,{path: '/1/m/' + thing_token},null,function(cmd,result,callback){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== proxyutils.HOST.allCodes.OK) return callback(proxyutils.HOST.describeResult(result));

      cmd.dumpObject(result.data);

      callback(null);
    });
  });
};