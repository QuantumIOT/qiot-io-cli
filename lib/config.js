var _ = require('lodash');

var config = {};

config.fileSettings = function(){ return config.helpers.readJSON(config.config_file,{},{}); };

config.reset = function(){

  config.config_file = '.qc.json'; // TODO put this at user home...

  config.defaults = {
    debug:      false,
    host_dns:   'qiot.io',
    host_port:  443
  };

  config.settings = _.extend({},config.defaults,config.fileSettings());

  config.logger.debugging = config.settings.debug;
};

config.update = function(newSettings){

  var fileSettings = config.fileSettings();
  var oldJSON = JSON.stringify(fileSettings);
  _.each(newSettings,function(value,key){
    if (fileSettings[key] !== value)
      if (config.defaults[key] === value || _.isUndefined(value))
        delete fileSettings[key];
      else
        fileSettings[key] = value;
  });

  var newJSON = JSON.stringify(fileSettings);
  if (oldJSON == newJSON) return;

  config.logger.debug(function(){return 'update config: ' + newJSON;});

  config.helpers.saveJSON(config.config_file,fileSettings);
  config.reset();
};

config.resetLoggerAndHelpers = function(){
  config.logger = require('./logger');
  config.helpers = require('./helpers');
};

config.resetLoggerAndHelpers();

config.reset();

module.exports = config;

