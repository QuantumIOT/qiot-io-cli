var _ = require('lodash');

var CMD = require('../lib/cmd');

module.exports = function(thingToken){
  var mqtt = require('mqtt');

  var cmd = new CMD();

  thingToken = cmd.bestThingToken(thingToken);

  var callback = cmd.ensureGoodCallback(arguments);
  
  if (!cmd.config.settings.account_token) return callback('no account token found');

  var credentials = new Buffer(cmd.config.settings.account_token,'base64').toString().split(':');
  if (credentials.length != 2) return callback('invalid account token');
  
  var client = mqtt.connect({
    host:       cmd.config.settings.proxy_dns,
    port:       cmd.config.settings.mqtt_port,
    clientId:   thingToken,
    username:   credentials[0],
    password:   credentials[1],
    keepalive:  60,
    clean:      true
  });

  function logEvent(event,logFunction){ client.on(event,function(data){ logFunction(event,data); }); }
  
  logEvent('error',    cmd.logger.error);
  logEvent('reconnect',cmd.logger.debug);
  logEvent('close',    cmd.logger.debug);
  logEvent('offline',  cmd.logger.debug);

  client.on('connect',function(ack){
    cmd.logger.debug(function(){ return 'connected: ' + JSON.stringify(ack); });

    _.defer(command);
  });

  client.subscribe('1/m/' + thingToken,{qos: 0},function(err,granted){
    cmd.logger.message('subscribe: ' + JSON.stringify(err) + ':' + JSON.stringify(granted));
    cmd.logger.consoleLOG();
  });

  client.on('message',function(topic,json){
    cmd.logger.message('mailbox message[' + topic + ']: ' + json);
    cmd.logger.consoleLOG();
  });

  var command = function(){
    cmd.prompt.get({name: 'publish'},function(error,result){
      if (error) {
        return client.end(false,callback)
      }

      cmd.logger.debug(JSON.stringify(result));
      var dataCheck = cmd.helpers.safeParseJSON(result.publish || null);
      if (!dataCheck)
        _.defer(command);
      else {
        client.publish('/1/l/' + thingToken,JSON.stringify({messages: _.concat([],dataCheck)}),{qos: 0,retain: true},function(err) {
          if (err)
            cmd.logger.error(err);
          else
            cmd.logger.debug('publish successful');
          _.defer(command);
        });
      }
    });
  };
};
