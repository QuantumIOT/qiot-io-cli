var _ = require('lodash');

var helpers = require(process.cwd() + '/lib/helpers');

module.exports.chai = require('chai');
module.exports.should = module.exports.chai.should();
module.exports.expect = module.exports.chai.expect;
module.exports.sinon = require('sinon');
module.exports.mockery = require('mockery');
module.exports.timekeeper = require('timekeeper');

module.exports.safeAssertions = function(done,callback) {
  try {
    callback();
  } catch (e) {
    done(e);
  }
};

module.exports.deferAssertions = function(done,callback){
  _.defer(module.exports.safeAssertions,done,callback);
};

// CONFIG GUARD

var ConfigGuard = {requirePath: process.cwd() + '/lib/config'};

ConfigGuard.beginGuarding = function(){
  ConfigGuard.config = require(ConfigGuard.requirePath);

  if (!ConfigGuard.previous) ConfigGuard.previous = JSON.stringify(ConfigGuard.config.settings);

  return ConfigGuard.config;
};

ConfigGuard.finishGuarding = function(){
  ConfigGuard.config.settings.should.eql(JSON.parse(ConfigGuard.previous));
};

module.exports.configGuard = ConfigGuard;

// MOCK HELPERS

var MockHelpers = _.clone(helpers);

MockHelpers.resetMock = function(){
  MockHelpers.readError = false;
  MockHelpers.filesToRead = {};
  MockHelpers.filesRead = [];
  MockHelpers.filesSaved = [];
  helpers.resetLogger();
};

MockHelpers.checkMockFiles = function(expectedReads,expectedSaves){
  MockHelpers.filesRead.should.eql(expectedReads || []);
  MockHelpers.filesRead = [];

  MockHelpers.filesSaved.should.eql(expectedSaves || []);
  MockHelpers.filesSaved = [];
};

MockHelpers.readJSON = function(filename, defaultJSON, errorJSON){
  var status = undefined;
  if (MockHelpers.readError) {
    status = 'error';
  } else if (MockHelpers.filesToRead[filename]) {
    status = 'success';
  } else {
    status = 'default';
  }
  MockHelpers.filesRead.push([filename,status]);
  return MockHelpers.readError ? errorJSON : MockHelpers.filesToRead[filename] ? _.clone(MockHelpers.filesToRead[filename]) : defaultJSON;
};

MockHelpers.saveJSON = function(filename, json){
  var clone = _.clone(json);
  MockHelpers.filesToRead[filename] = clone;
  MockHelpers.filesSaved.push([filename,clone]);
};

MockHelpers.resetMock();

module.exports.mockHelpers = MockHelpers;

// MOCK LOGGER

var MockLogger = {debugging: false};

MockLogger.resetMock = function(){
  MockLogger.showLogs = false;
  MockLogger.logEntries = [];
};

MockLogger.checkMockLogEntries = function(expectation){
  MockLogger.logEntries.should.eql(expectation || []);
  MockLogger.logEntries = [];
};

MockLogger.message = function(string){
  if (MockLogger.showLogs) console.log(string);
  MockLogger.logEntries.push(string);
};

MockLogger.error = function(error) {
  MockLogger.message('ERROR - ' + error);
};

MockLogger.debug = function(debug){
  MockLogger.debugging && MockLogger.message('DEBUG - ' + (typeof debug == 'function' ? debug() : debug));
};

MockLogger.resetMock();

module.exports.mockLogger = MockLogger;

// MOCK HTTP(S)

var mockCounter = 0;

var MockHTTP = function(){
  var self = this;

  self.instanceCount = mockCounter++;
  self.eventCallbacks = {};
  self.dataWritten = [];
  self.dataToRead = null;
  self.statusCode = 200;
};

MockHTTP.prototype.on = function(event,callback){
  var self = this;

  self.eventCallbacks[event] = callback;
  if (event == 'end')
    _.defer(function(){
      self.eventCallbacks.request(self);
      if (self.dataToRead) self.eventCallbacks.data(self.dataToRead);
      self.eventCallbacks.end(null);
    });

  return self;
};

MockHTTP.prototype.write = function(data){
  var self = this;

  self.dataWritten.push('write=' + data);

  return self;
};

MockHTTP.prototype.end = function(){
  var self = this;

  self.dataWritten.push('end');
  _.defer(self.eventCallbacks.request,self);

  return self;
};

MockHTTP.prototype.request = function(options,callback){
  var self = this;

  self.dataWritten.push('request=' + JSON.stringify(options));
  self.eventCallbacks.request = callback;

  return self;
};

module.exports.MockHTTP = MockHTTP;
