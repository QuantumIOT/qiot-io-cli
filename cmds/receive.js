var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(thing_token){

  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  console.log(thing_token);
};