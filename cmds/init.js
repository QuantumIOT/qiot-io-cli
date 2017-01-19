var CMD = require('../lib/cmd');

module.exports = function(){

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  cmd.prompt.start();

  var args = [
    {name: 'debug',             description: 'debug mode',        default: cmd.config.settings.debug, type: 'boolean'},
    {name: 'host_dns',          description: 'host DNS',          default: cmd.config.settings.host_dns},
    {name: 'account_token',     description: 'account token',     default: cmd.config.settings.account_token}
  ];
  cmd.prompt.get(args,function(error,result){
    cmd.safeguard(callback,function() {
      if (error) return callback(error);

      cmd.config.update(result);

      callback(null);
    });
  });

};