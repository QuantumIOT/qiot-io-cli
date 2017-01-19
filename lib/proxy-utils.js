var _ = require('lodash');

var CMD = require('./cmd');
var HOST = require('./host');

var proxyutils = { HOST: HOST };

proxyutils.request = function(args,options,message,success){
  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(args);

  if (!cmd.config.settings.account_token) return callback('no account_token found');

  options = _.merge({host: cmd.config.settings.proxy_dns,headers: {Authorization: 'QIOT ' + cmd.config.settings.account_token}},options);

  var host = new HOST();

  host.request(options,cmd.helpers.safeParseJSON(message || null)).then(function(result){ success(cmd,result,callback) },callback);
};

proxyutils.post = function(args,path,message){
  proxyutils.request(args,{method: 'POST',path: path},message,function(cmd,result,callback){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.NO_CONTENT) return callback(HOST.allCodes.getStatusText(result.statusCode));

      callback(null);
    });
  });
};

module.exports = proxyutils;