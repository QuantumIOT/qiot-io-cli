var _ = require('lodash');

var CMD = require('../lib/cmd');

module.exports = function(service,event,data){
  var socketIO = require('socket.io-client');
  var wildcard = require('socketio-wildcard');

  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var endpoint = 'https://' + cmd.config.settings.host_dns;// + '/' + service;
  var path = '/' + service + '/socket.io';

  cmd.logger.debug(endpoint,path);

  var socket = socketIO(endpoint,{
    path: path,
    timeout: 500
  });

  var patch = wildcard(socketIO.Manager);
  patch(socket);

  socket.on('*', function(args){
    if (!args || !args.type === 2 || !args.nsp === '/' || !_.isArray(args.data) || args.data.length !== 2) return cmd.logger.error('unexpected event',args);

    cmd.dumpObject({event: args.data[0],data: args.data[1]})
  });

  function logSocketEvent(socket,event,logFunction){
    cmd.logger.debug('on',event);

    socket.on(event,function(data){ logFunction(event,data); });
  }

  logSocketEvent(socket,'connect_error',cmd.logger.error);
  logSocketEvent(socket,'error',cmd.logger.error);

  logSocketEvent(socket,'disconnect',cmd.logger.message);

  logSocketEvent(socket,'reconnect',cmd.logger.message);
  logSocketEvent(socket,'reconnect_attempt',cmd.logger.debug);
  logSocketEvent(socket,'reconnecting',cmd.logger.debug);
  logSocketEvent(socket,'reconnect_failed',cmd.logger.error);
  logSocketEvent(socket,'reconnect_error',cmd.logger.error);

  logSocketEvent(socket,'event',cmd.logger.message); // TODO does this work??

  socket.on('connect',function(){
    cmd.logger.message('connect');

    cmd.logger.debug('emit(authentication,...)');

    socket.emit('authentication',{auth_token: cmd.config.settings.user_token});

    socket.on('authenticated',function(){
      cmd.logger.debug(function(){ return 'emit(' + event + ',' + data + ')';});

      socket.emit(event,data);
    });
  });

  cmd.logger.message('waiting...');

  callback(null);
};
