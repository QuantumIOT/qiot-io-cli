var regexEmail = require('regex-email');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(email,password){

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  cmd.options.email     = email;
  cmd.options.password  = password;

  if (cmd.options.email && !regexEmail.test(cmd.options.email)) return callback('invalid email address');

  cmd.prompt.start();

  var specs = [
    {name: 'email',   required: true,pattern: regexEmail},
    {name: 'password',required: true,hidden: true}
  ];

  cmd.ensureOptions(specs).then(function(){
    var host = new HOST();

    host.post('/users/signin',{email: cmd.options.email,password: cmd.options.password}).then(function(result){
      cmd.safeguard(callback,function() {
        if (result.statusCode !== HOST.allCodes.OK || !result.data.token) return callback('unsuccessful signin: ' + HOST.allCodes.getStatusText(result.statusCode));

        cmd.establishUser(result.data.token);

        callback(null);
      });
    },callback);

  },callback);
};