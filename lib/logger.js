var _ = require('lodash');
var logger = {debugging: false,timestamp: true,consoleLOG: console.log};

logger.message = function(message,data){
  var string = messageWithData(message,data);
  if (logger.timestamp) string = (new Date().toISOString()) + ' - ' + string;
  logger.consoleLOG(string);
};

logger.error = function(error,data) {
  logger.message('ERROR - ' + messageWithData(error,data));
};

logger.debug = function(debug,data){
  logger.debugging && logger.message('DEBUG - ' + (typeof debug == 'function' ? debug(data) : messageWithData(debug,data)));
};

function messageWithData(message,data){
  return _.isUndefined(data) ? message : message + ': ' + bestDataString(data);
}

function bestDataString(data){
  if (_.isString(data)) return data;
  if (_.isObject(data) && data.toString() !== '[object Object]') return data.toString();

  return JSON.stringify(data);
}

module.exports = logger;