var CMD = require('../lib/cmd');

module.exports = function(options,callback){

  var cmd = new CMD();

  cmd.prompt.start();

  var args = [
    {name: 'debug',   description: 'debug mode',default: cmd.config.settings.debug, type: 'boolean'},
    {name: 'host_dns',description: 'host DNS',  default: cmd.config.settings.host_dns}
  ];
  cmd.prompt.get(args,function(error,result){
    if (error) return cmd.logger.error(error);

    cmd.config.update(result);

    callback && callback();
  });

};