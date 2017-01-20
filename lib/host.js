var _ = require('lodash');

var Host = function(authenticate){
  var self = this;

  self.authenticate = !!authenticate;

  // NOTE - delay loading for testability
  self.service  = require('https');

  self.config   = require('./config');
  self.helpers  = require('./helpers');
  self.logger   = require('./logger');
};

Host.allCodes = require('http-status-codes');

Host.describeResult = function(result){
  return Host.allCodes.getStatusText(result.statusCode) + (result.error ? ': ' + result.error : '');
};

Host.prototype.get = function(path){
  return this.request({path: path})
};

Host.prototype.put = function(path,body){
  return this.request({method: 'PUT',path: path},body)
};

Host.prototype.post = function(path,body){
  return this.request({method: 'POST',path: path},body);
};

Host.prototype.request = function(options,body){
  var self = this;

  var bodyJSON = body ? JSON.stringify(body) : null;

  var defaultOptions = {
    method: bodyJSON ? 'POST' : 'GET',
    host:   self.config.settings.host_dns,
    port:   443
  };

  options = _.merge(defaultOptions,options);

  var defaultHeaders = {'Content-Type' : 'application/json'};
  if (self.authenticate && self.config.settings.user_token) defaultHeaders.Authorization = 'Bearer ' + self.config.settings.user_token;
  if (bodyJSON) defaultHeaders['Content-Length'] = Buffer.byteLength(bodyJSON,'utf8');

  options.headers = _.merge(defaultHeaders,options.headers || {});

  return new Promise(function(resolve,reject){
    self.logger.debug(function() { return 'host (' + options.host + ') ' + options.method + ' ' + options.path + ' : ' + bodyJSON; });

    var request = self.service.request(options,function(response){
      var error   = null;
      var data    = null;

      response.on('data',function(dataBuffer){
        if (error) return;

        try {
          var dataString = dataBuffer.toString();

          self.logger.debug(function() { return 'host output: ' + dataString });

          data = (data || '') + dataString;

        } catch(err) {
          error = err;
        }
      });

      response.on('end',function(){
        self.logger.debug(function() { return 'host status: ' + Host.allCodes.getStatusText(response.statusCode); });

        if (error)
          reject(error);
        else if (response.statusCode == Host.allCodes.OK)
          resolve({statusCode: Host.allCodes.OK,data: self.helpers.safeParseJSON(data)});
        else
          resolve({statusCode: response.statusCode,error: data});
      });
    });

    request.on('error',reject);

    if (bodyJSON) request.write(bodyJSON);

    request.end();
  });
};

module.exports = Host;