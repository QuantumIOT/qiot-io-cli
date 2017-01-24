var _ = require('lodash');
var socketIO = require('socket.io-client');
var wildcard = require('socketio-wildcard');

var CMD = require('../lib/cmd');

module.exports = function(service,event,data){
  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(arguments);

  var endpoint = 'https://' + cmd.config.settings.host_dns;// + '/' + service;
  var path = '/' + service + '/socket.io';

  console.log(endpoint,path);

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

  socket.on('connect_error',cmd.logger.error);
  socket.on('error',cmd.logger.error);

  socket.on('disconnect',cmd.logger.message);

  socket.on('reconnect',cmd.logger.message);
  socket.on('reconnect_attempt',cmd.logger.message);
  socket.on('reconnecting',cmd.logger.message);
  socket.on('reconnect_failed',cmd.logger.message);
  socket.on('reconnect_error',cmd.logger.message);

  socket.on('event',cmd.logger.message); // TODO does this work??

  socket.on('connect',function(){
    cmd.logger.message('connected');

    socket.emit('authentication',{auth_token: cmd.config.settings.user_token});

    socket.on('authenticated',function(){
      cmd.logger.debug(function(){ return 'emit(' + event + ',' + data + ')';});

      socket.emit(event,data);
    });
  });


  cmd.logger.message('waiting...');

  callback(null);
};