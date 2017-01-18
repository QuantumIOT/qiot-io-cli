var CMD = require('../lib/cmd');

module.exports = function(options,callback){

  var cmd = new CMD();

  callback = cmd.ensureGoodCallback(callback);

  cmd.prompt.start();

  var args = [
    {name: 'debug',   description: 'debug mode',default: cmd.config.settings.debug, type: 'boolean'},
    {name: 'host_dns',description: 'host DNS',  default: cmd.config.settings.host_dns}
  ];
  cmd.prompt.get(args,function(error,result){
    if (error) return callback(error);

    cmd.config.update(result);

    callback(null);
  });

};