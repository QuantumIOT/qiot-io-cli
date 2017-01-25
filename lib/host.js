var _ = require('lodash');

var HOST = function(auth_type){
  var self = this;

  self.auth_type = auth_type;

  // NOTE - delay loading for testability
  self.service  = require('https');

  self.config   = require('./config');
  self.helpers  = require('./helpers');
  self.logger   = require('./logger');
};

HOST.AUTH_USER    = 'user_token';
HOST.AUTH_ACCT = 'account_token';

HOST.allCodes = require('http-status-codes');

HOST.describeResult = function(result){
  return HOST.allCodes.getStatusText(result.statusCode) + (result.error ? ': ' + result.error : '');
};

HOST.prototype.request = function(options, body){
  var self = this;

  var defaultOptions = {
    method: body ? 'POST' : 'GET',
    host:   self.config.settings.host_dns,
    port:   443
  };

  options = _.merge(defaultOptions,options);

  var defaultHeaders = {'Content-Type' : 'application/json'};
  if (self.auth_type == HOST.AUTH_USER && self.config.settings[HOST.AUTH_USER]) defaultHeaders.Authorization = 'Bearer '  + self.config.settings[HOST.AUTH_USER];
  if (self.auth_type == HOST.AUTH_ACCT && self.config.settings[HOST.AUTH_ACCT]) defaultHeaders.Authorization = 'QIOT '    + self.config.settings[HOST.AUTH_ACCT];
  if (body) defaultHeaders['Content-Length'] = Buffer.byteLength(body,'utf8');

  options.headers = _.merge(defaultHeaders,options.headers || {});

  return new Promise(function(resolve,reject){
    self.logger.debug(function() { return 'host (' + options.host + ') ' + options.method + ' ' + options.path + ' : ' + body; });

    var request = self.service.request(options,function(response){
      var error   = null;
      var data    = null;

      response.on('data',function(dataBuffer){
        if (error) return;

        try {
          var dataString = dataBuffer.toString();

          self.logger.debug('host output',dataString);

          data = (data || '') + dataString;

        } catch(err) {
          error = err;
        }
      });

      response.on('end',function(){
        self.logger.debug(function() { return 'host status: ' + HOST.allCodes.getStatusText(response.statusCode); });

        if (error)
          reject(error);
        else if (response.statusCode == HOST.allCodes.OK)
          resolve({statusCode: HOST.allCodes.OK,data: self.helpers.safeParseJSON(data)});
        else
          resolve({statusCode: response.statusCode,error: data});
      });
    });

    request.on('error',reject);

    if (body) request.write(body);

    request.end();
  });
};

module.exports = HOST;