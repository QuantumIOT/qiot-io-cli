var _ = require('lodash');
var CMD = require('../lib/cmd');

module.exports = function(options){

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var abbreviation = undefined;

  if (options.reset) return updateConfig(null,cmd.config.defaults);

  cmd.prompt.start();

  var basis = options.defaults ? cmd.config.defaults : cmd.config.settings;

  var ABBREV_LENGTH = 22;
  var user_token = basis.user_token;

  if (user_token) abbreviation = user_token.substr(0,ABBREV_LENGTH) + '...' + user_token.substr(user_token.length - ABBREV_LENGTH,ABBREV_LENGTH);

  var args = [
    {name: 'debug',             description: 'debug mode',        default: basis.debug, type: 'boolean'},
    {name: 'host_dns',          description: 'host DNS',          default: basis.host_dns},
    {name: 'proxy_dns',         description: 'thing proxy DNS',   default: basis.proxy_dns},
    {name: 'account_token',     description: 'account token',     default: basis.account_token},
    {name: 'user_token',        description: 'user token',        default: abbreviation}
  ];

  cmd.prompt.get(args,updateConfig);

  function updateConfig(error,result){
    cmd.safeguard(callback,function() {
      if (error) return callback(error);

      if (abbreviation && result.user_token == abbreviation) delete result.user_token;

      _.each(result,function(value,key){ if (!value) result[key] = undefined; });

      cmd.config.update(result);

      callback(null);
    });
  }

};