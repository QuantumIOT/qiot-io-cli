var _ = require('lodash');

var CMD = require('../lib/cmd');

module.exports = function(service,event,data){
  var socketIO = require('socket.io-client');
  var wildcard = require('socketio-wildcard');

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var endpoint = cmd.config.settings.host_service + '://' + cmd.config.settings.host_dns + ':' + cmd.config.settings.host_port;
  var path = (cmd.config.settings.users_prefix ? '/' + service : '') + '/socket.io';

  cmd.logger.debug(endpoint,path);

  var socket = socketIO(endpoint,{
    path: path,
    timeout: 500
  });

  var patch = wildcard(socketIO.Manager);
  patch(socket);

  socket.on('*', function(args){
    if (!args || !args.type === 2 || !args.nsp === '/' || !_.isArray(args.data) || args.data.length < 2) return cmd.logger.error('unexpected event',args);

    cmd.dumpObject({event: args.data[0],response: args.data[1]},true)
  });

  function logEvent(event,logFunction){ socket.on(event,function(data){ logFunction(event,data); }); }

  logEvent('connect_error',     cmd.logger.error);
  logEvent('error',             cmd.logger.error);
  logEvent('disconnect',        cmd.logger.message);
  logEvent('reconnect',         cmd.logger.message);
  logEvent('reconnect_attempt', cmd.logger.debug);
  logEvent('reconnecting',      cmd.logger.debug);
  logEvent('reconnect_failed',  cmd.logger.error);
  logEvent('reconnect_error',   cmd.logger.error);
  logEvent('event',             cmd.logger.message); // TODO does this work??

  socket.on('authenticated',function(){
    cmd.logger.debug(function(){ return 'emit(' + event + ',' + data + ')';});

    socket.emit(event,data);
  });

  socket.on('connect',function(){
    cmd.logger.message('connect');
    cmd.logger.debug('emit(authentication,...)');

    socket.emit('authentication',{auth_token: cmd.config.settings.user_token});
  });

  cmd.logger.message('waiting...');

  callback(null);
};
