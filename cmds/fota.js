var _ = require('lodash');

var API = require('../lib/api');
var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(thingToken,specs){
  var originalArguments = arguments;

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var errors = [];
  var actions = [];

  _.each(specs,function(spec){
    var parts = spec.split(',');
    var action = {type: 'fota',target: parts[0],version: parts[1],url: parts[2],pieces: {}};

    if (!action.url) {
      if (!cmd.config.settings.fota_url_prefix) return errors.push('missing fota url prefix');

      action.url = cmd.config.settings.fota_url_prefix + action.version + cmd.config.settings.fota_url_suffix;

      cmd.logger.debug('constructed url',action.url);
    }

    var matches = action.url.match(/^(http|https):\/\/([^\/]+)(\/.*\/([^\/]+))\.bin$/i);
    if (!matches) return errors.push('invalid url: ' + action.url);

    action.pieces.service = require(matches[1]);
    action.pieces.host = matches[2];
    action.pieces.prefix = matches[3];

    actions.push(action);
  });

  if (errors.length > 0) return callback(errors.join('; '));

  function finishAction(action){
    var service = action.pieces.service;
    var host    = action.pieces.host;
    var prefix  = action.pieces.prefix;

    delete action.pieces;

    function downloadNumber(key,path){
      return new Promise(function(resolve,reject){
        cmd.logger.debug(key,path);

        service
          .request({host: host, path: path},function(response){
            var data = '';
            response
              .on('data',function(buffer){data += buffer.toString()})
              .on('end',function(){
                if (response.statusCode !== HOST.allCodes.OK)
                  reject(HOST.allCodes.getStatusText(response.statusCode));
                else if (isNaN(data))
                  reject(key + ' is not a number');
                else {
                  cmd.logger.debug(key,data);

                  resolve(action[key] = +data);
                }
              });
          })
          .on('error',reject)
          .end();
      });
    }

    return new Promise(function(resolve,reject){
      Promise.all([ downloadNumber('filesize',prefix + '.filesize'),downloadNumber('checksum',prefix + '.checksum') ]).then(resolve).catch(reject);
    });
  }

  Promise.all(actions.map(function(action){ return finishAction(action); })).catch(callback).then(function(){
    cmd.options.thing_token = cmd.bestThingToken(thingToken);
    cmd.options.body = JSON.stringify({actions: actions});

    function echoMailbox(error){
      if (error) return callback(error);

      cmd.options.body = null;
      API.executeDefn(originalArguments,API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: false}));
    }

    API.executeDefn([echoMailbox],API.findDefn({command: 'mailbox',required_options: ['thing_token'],body: true}));
  });

};
