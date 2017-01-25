var regexEmail = require('regex-email');

var CMD = require('../lib/cmd');
var API = require('../lib/api')

module.exports = function(email,password){
  var originalArgs = arguments;

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
    return API.executeDefn(originalArgs,API.findDefn({command: 'signin',required_options: ['email','password']}));
  },callback);
};