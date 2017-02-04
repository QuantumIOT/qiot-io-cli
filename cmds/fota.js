var _ = require('lodash');

var API = require('../lib/api');
var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(thing_token,url,filesize,checksum){
  var originalArguments = arguments;

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);
  
  var matches = url.match(/^(http|https):\/\/([^\/]+)(\/.*\/([^\/]+))\.bin$/i);
  if (!matches) return callback('invalid url: ' + url);

  var protocol = matches[1];
  var host = matches[2];
  var prefix = matches[3];
  var version = matches[4];

  var service = require(protocol);

  function downloadNumber(key,path){
    return new Promise(function(resolve,reject){
      cmd.logger.debug(key,path);

      service
        .request({host: host, path: path},function(response){
          var data = '';
          response
            .on('data',function(buffer){data += buffer.toString()})
            .on('end',function(){
              if (response.statusCode != HOST.allCodes.OK)
                reject(HOST.allCodes.getStatusText(response.statusCode));
              else {
                cmd.logger.debug(key,data);

                resolve(cmd.options[key] = data);
              }
            });
        })
        .on('error',reject)
        .end();
    });
  }

  downloadNumber('filesize',prefix + '.filesize').then(function(){ return downloadNumber('checksum',prefix + '.checksum'); }).then(function(){
    var message = {actions: [{version: version,filesize: +cmd.options.filesize,checksum: +cmd.options.checksum,url: url}]};

    if (_.isNaN(message.actions[0].filesize) || message.actions[0].filesize <= 0) return callback('invalid filesize: ' + cmd.options.filesize);
    if (_.isNaN(message.actions[0].checksum) || message.actions[0].checksum <= 0) return callback('invalid checksum: ' + cmd.options.checksum);

    cmd.options.thing_token = thing_token;
    cmd.options.body = JSON.stringify(message);

    function echoMailbox(error){
      if (error) return callback(error);

      cmd.options.body = null;
      API.executeDefn(originalArguments,API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: false}));
    }

    API.executeDefn([echoMailbox],API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: true}));
  }).catch(callback);
};
