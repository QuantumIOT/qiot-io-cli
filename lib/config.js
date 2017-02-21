var _ = require('lodash');

var config = {};

config.fileSettings = function(){ return config.helpers.readJSON(config.config_file,{},{}); };

config.reset = function(){

  config.config_file = '.qc.json'; // TODO put this at user home...

  config.defaults = {
    debug:              false,
    host_service:       'https',
    host_port:          443,
    host_dns:           'qiot.io',
    proxy_dns:          'api.qiot.io',
    mqtt_protocol:      'mqtts',
    mqtt_port:          8883,
    users_prefix:       true,
    account_token:      undefined,
    user_token:         undefined,
    current_account:    undefined,
    current_user:       undefined,
    current_collection: undefined,
    fota_url_prefix:    undefined,
    fota_url_suffix:    '.bin'
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

  config.logger.debug('update config',newJSON);

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

