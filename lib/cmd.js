var _ = require('lodash');
var flat = require('flat');
var table = require('table');

function CmdContext(){
  var self = this;

  // NOTE - delay loading for testability
  self.prompt   = require('prompt');
  self.options  = require('commander');

  self.config   = require('./config');
  self.helpers  = require('./helpers');
  self.logger   = require('./logger');
}

CmdContext.prototype.ensureOption = function(spec){
  var self = this;

  return new Promise(function(resolve,reject){
    var key = spec.name;
    if (self.options[key]) return resolve(self.options[key]);

    self.prompt.get([spec],function(error,result){
      if (error) return reject(error);

      self.options[key] = result[key];
      resolve(null);
    });
  });
};

CmdContext.prototype.ensureOptions = function(specs){
  var self = this;

  return new Promise(function(resolve,reject){

    function nextSpec(){
      if (specs.length == 0) return resolve(null);

      var spec = specs.shift();
      self.ensureOption(spec).then(nextSpec,reject);
    }
    nextSpec();
  });
};

CmdContext.prototype.dumpObject = function(object){
  var self = this;

  self.timestampOFF(function(){
    _.each(flat.flatten(object),function(value,key){ self.logger.message(key + ':\t' + value); });
  });
};

CmdContext.prototype.dumpTable = function(fields,objects){
  var self = this;

  self.timestampOFF(function(){
    var tableOptions = {};
    tableOptions.drawHorizontalLine = function(index,size) { return index == 1; };
    tableOptions.border =  table.getBorderCharacters('void');
    tableOptions.border.joinBody = '─';
    tableOptions.border.joinJoin = ' ';
    tableOptions.border.bodyJoin = ' ';

    var rows = [fields];

    _.each(objects,function(object){ rows.push(fields.map(function(key){ return object[key]; })) });

    self.logger.message(table.table(rows,tableOptions));
  });
};

CmdContext.prototype.timestampOFF = function(callback){
  var self = this;

  var oldTimestamp = self.logger.timestamp;
  self.logger.timestamp = false;

  var result = callback();

  self.logger.timestamp = oldTimestamp;

  return result;
};

module.exports = CmdContext;