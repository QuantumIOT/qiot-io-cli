var _ = require('lodash');

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

module.exports = CmdContext;