var regexEmail = require('regex-email');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(options,callback){

  var specs = [
    {name: 'email',   required: true,pattern: regexEmail},
    {name: 'password',required: true,hidden: true}
  ];

  var cmd = new CMD();

  callback = cmd.ensureGoodCallback(callback);

  cmd.prompt.start();

  if (regexEmail.test(cmd.options.user)) cmd.options.email = cmd.options.user;

  cmd.ensureOptions(specs).then(function(){
    var host = new HOST();

    host.post('/users/signin',null,{email: cmd.options.email,password: cmd.options.password}).then(function(result){

      if (result.statusCode !== host.allCodes.OK || !result.data.token) return callback('unsuccessful signin: ' + host.allCodes.getStatusText(result.statusCode));

      cmd.config.update({auth_token: result.data.token});

      callback(null);

    },callback);

  },callback);
};