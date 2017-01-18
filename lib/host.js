var _ = require('lodash');
var codes = require('http-status-codes');

var Host = function(){
  var self = this;

  // NOTE - delay loading for testability
  self.service  = require('https');

  self.config   = require('./config');
  self.helpers  = require('./helpers');
  self.logger   = require('./logger');
};

Host.prototype.get = function(path){
  return this.request({path: path})
};

Host.prototype.post = function(path,options,body){
  return this.request(_.merge({method: 'POST',path: path},options || {}),body);
};

Host.prototype.request = function(options,message){
  var self = this;

  var messageJSON = message ? JSON.stringify(message ) : null;

  var defaultOptions = {
    method: messageJSON ? 'POST' : 'GET',
    host:   self.config.settings.host_dns || 'unknown-host-dns',
    port:   443
  };

  options = _.merge(defaultOptions,options || {});

  var defaultHeaders = {'Content-Type' : 'application/json'};
  if (messageJSON) defaultHeaders['Content-Length'] = Buffer.byteLength(messageJSON,'utf8');

  options.headers = _.merge(defaultHeaders,options.headers || {});

  return new Promise(function(resolve,reject){
    self.logger.debug(function() { return 'host ' + options.method + ': ' + messageJSON; });

    var request = self.service.request(options,function(response){
      var error   = null;
      var data    = null;

      response.on('data',function(dataBuffer){
        try {
          var dataJSON = dataBuffer.toString();

          self.logger.debug(function() { return 'host output: ' + dataJSON });

          data = self.helpers.safeParseJSON(dataJSON);

          if (!data) error = 'no json received';

        } catch(err) {
          error = err;
        }
      });

      response.on('end',function(){
        self.logger.debug(function() { return 'host status: ' + codes.getStatusText(response.statusCode); });

        if (error)
          reject(error);
        else
          resolve({statusCode: response.statusCode,data: data});
      });
    });

    request.on('error',reject);

    if (messageJSON) request.write(messageJSON);

    request.end();
  });
};

module.exports = Host;