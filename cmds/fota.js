var _ = require('lodash');

var CMD = require('../lib/cmd');
var API = require('../lib/api');

module.exports = function(thing_token,url,filesize,checksum){
  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var matches = url.match(/([^\/]+)\.bin$/i);
  if (!matches) return callback('invalid url: ' + url);

  var message = {actions: [{version: matches[1],filesize: +filesize,checksum: +checksum,url: url}]};
  
  if (_.isNaN(message.actions[0].filesize) || message.actions[0].filesize <= 0) return callback('invalid filesize: ' + filesize);
  if (_.isNaN(message.actions[0].checksum) || message.actions[0].checksum <= 0) return callback('invalid checksum: ' + checksum);

  cmd.options.thing_token = thing_token;
  cmd.options.body = JSON.stringify(message);

  var originalArguments = arguments;

  function echoMailbox(error){
    if (error) return callback(error);

    cmd.options.body = null;
    API.executeDefn(originalArguments,API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: false}));
  }

  return API.executeDefn([echoMailbox],API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: true}));
};
