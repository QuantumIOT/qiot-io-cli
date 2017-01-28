var fs = require('fs');

var logger = null;

var helpers = {};

helpers.readJSON = function(filename,defaultJSON,errorJSON){
  try {
    return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename)) : defaultJSON;
  } catch(error) {
    logger.error(error);
    return errorJSON;
  }
};

helpers.saveJSON = function(filename,json){
  try {
    fs.writeFileSync(filename,JSON.stringify(json,null,2));
  } catch(error) {
    logger.error('save JSON error',error);
  }
};

helpers.safeParseJSON = function(json) {
  try {
    return JSON.parse(json);
  } catch(e) {
    logger.error('json error',e);
    return null;
  }
};

helpers.fileExists = function(filename){
  try {
    return fs.statSync(filename);
  } catch(error) {
    return null;
  }
};

helpers.resetLogger = function(){
  logger = require('./logger');
};

helpers.resetLogger();

module.exports = helpers;