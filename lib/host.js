var _ = require('lodash');
var codes = require('http-status-codes');

var Host = function(authenticate,options){
  var self = this;

  self.allCodes     = codes;
  self.authenticate = !!authenticate;
  self.baseOptions  = options || {};

  // NOTE - delay loading for testability
  self.service  = require('https');

  self.config   = require('./config');
  self.helpers  = require('./helpers');
  self.logger   = require('./logger');
};

Host.allCodes = codes;

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

  options = _.merge(defaultOptions,self.baseOptions,options || {});

  var defaultHeaders = {'Content-Type' : 'application/json'};
  if (self.authenticate && self.config.settings.user_token) defaultHeaders.Authorization = 'Bearer ' + self.config.settings.user_token;
  if (bodyJSON) defaultHeaders['Content-Length'] = Buffer.byteLength(bodyJSON,'utf8');

  options.headers = _.merge(defaultHeaders,options.headers || {});

  return new Promise(function(resolve,reject){
    self.logger.debug(function() { return 'host (' + options.host + ') ' + options.method + ' ' + options.path + ' : ' + bodyJSON; });

    var request = self.service.request(options,function(response){
      var error   = null;
      var json    = null;

      response.on('data',function(dataBuffer){
        if (error) return;

        try {
          var dataString = dataBuffer.toString();

          self.logger.debug(function() { return 'host output: ' + dataString });

          json = (json || '') + dataString;

        } catch(err) {
          error = err;
        }
      });

      response.on('end',function(){
        self.logger.debug(function() { return 'host status: ' + self.allCodes.getStatusText(response.statusCode); });

        if (error)
          reject(error);
        else
          try {
            resolve({statusCode: response.statusCode,data: self.helpers.safeParseJSON(json)});
          } catch(err) {
            reject(err);
          }
      });
    });

    request.on('error',reject);

    if (bodyJSON) request.write(bodyJSON);

    request.end();
  });
};

module.exports = Host;