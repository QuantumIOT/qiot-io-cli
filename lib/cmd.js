var _ = require('lodash');
var flat = require('flat');
var table = require('table');
var styles = require('ansi-styles');

var CURRENT_OPTION_PREFIX = 'current_';

function CmdContext(){
  var self = this;

  self.ACCOUNT_OPTION     = 'account';
  self.COLLECTION_OPTION  = 'collection';

  // NOTE - delay loading for testability
  self.prompt   = require('prompt');
  self.options  = require('commander');

  self.config   = require('./config');
  self.helpers  = require('./helpers');
  self.logger   = require('./logger');

  self.goodCallback = function(error) { if (error) self.logger.error(error); };
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

  var rows = _.toPairs(flat.flatten(object)).map(function(pair){
    pair[0] = styles.bold.open + pair[0] + styles.bold.close;
    return pair;
  });

  var tableOptions = self.tableOptions();
  tableOptions.drawHorizontalLine = function(index,size) { return false; };

  self.logger.consoleLOG(table.table(rows,tableOptions));
};

CmdContext.prototype.dumpTable = function(fields,objects){
  var self = this;

  if (self.options.verbose && objects.length > 0) fields = _.keys(flat.flatten(objects[0]));

  var rows = [fields.map(function(field){ return styles.bold.open + field + styles.bold.close; })];

  _.each(objects,function(object){
    var flatObject = flat.flatten(object);

    rows.push(fields.map(function(key){ return flatObject[key]; }));
  });

  var tableOptions = self.tableOptions();
  tableOptions.drawHorizontalLine = function(index,size) { return index == 1; };

  self.logger.consoleLOG(table.table(rows,tableOptions));
};

CmdContext.prototype.tableOptions = function(){
  var tableOptions = {};
  tableOptions.border =  table.getBorderCharacters('void');
  tableOptions.border.joinBody = '─';
  tableOptions.border.joinJoin = ' ';
  tableOptions.border.bodyJoin = ' ';
  return tableOptions;
};

CmdContext.prototype.ensureGoodCallback = function(callback){
  return callback || this.goodCallback;
};

CmdContext.prototype.checkSaveClear = function(keys){
  var self = this;

  keys = _.concat([],keys);

  if (self.options.clear)
    self.config.update(_.fromPairs(keys.map(function(key){ return [CURRENT_OPTION_PREFIX + key,undefined]; })));
  else if (self.options.save)
    self.config.update(_.fromPairs(keys.map(function(key){ return [CURRENT_OPTION_PREFIX + key,self.options[key]]; })));
};

CmdContext.prototype.bestOption = function(key){
  var self = this;

  if (!self.options[key]) self.options[key] = self.config.settings[CURRENT_OPTION_PREFIX + key];

  return self.options[key];
};

module.exports = CmdContext;