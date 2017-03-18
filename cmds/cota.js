var _ = require('lodash');
var flat = require('flat');

var API = require('../lib/api');
var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(thingToken,settings){
  var originalArguments = arguments;

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var errors = [];
  var cfg = {};
  _.each(settings,function(setting){
    var result = setting.match(/(\w+(\.\w+)*)=(.*)/);

    if (!result) return errors.push(setting);

    var key = result[1];
    var value = result[3];

    if (!isNaN(value)) value = +value;

    cfg[key] = value;
  });

  if (errors.length > 0) return callback('settings must be in the form <key>=<value>: ' + errors.join(' '));

  cmd.options.thing_token = cmd.bestThingToken(thingToken);
  cmd.options.body = JSON.stringify({cfg: flat.unflatten(cfg)});

  function echoMailbox(error){
    if (error) return callback(error);

    cmd.options.body = null;
    API.executeDefn(originalArguments,API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: false}));
  }

  API.executeDefn([echoMailbox],API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: true}));
};
