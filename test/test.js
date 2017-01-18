var _ = require('lodash');

var helpers = require(process.cwd() + '/lib/helpers');

var test = {};

test.chai = require('chai');
test.should = test.chai.should();
test.expect = test.chai.expect;
test.sinon = require('sinon');
test.mockery = require('mockery');
test.timekeeper = require('timekeeper');

test.safeAssertions = function(done,callback) {
  try {
    callback();
  } catch (e) {
    done(e);
  }
};

test.deferAssertions = function(done,callback){
  _.defer(test.safeAssertions,done,callback);
};

test.standardBeforeEach = function(allowed){
  test.mockery.enable();
  test.mockery.warnOnReplace(false);
  test.mockery.registerAllowables(_.concat(allowed || [],['lodash','./config',test.configGuard.requirePath]));
  test.mockery.registerMock('./logger', test.mockLogger);
  test.mockLogger.resetMock();
  test.mockery.registerMock('./helpers',test.mockHelpers);
  test.mockHelpers.resetMock();

  var config = test.configGuard.beginGuarding();
  test.mockHelpers.resetMock();

  test.mockLogger.debugging = true;

  return config;
};

test.standardAfterEach = function(){
  test.mockLogger.debugging = false;

  test.configGuard.finishGuarding();
  test.mockHelpers.checkMockFiles();
  test.mockLogger.checkMockLogEntries();
  test.mockery.deregisterAll();
  test.mockery.disable();
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

test.configGuard = ConfigGuard;

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

test.mockHelpers = MockHelpers;

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

test.mockLogger = MockLogger;

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

test.MockHTTP = MockHTTP;

module.exports = test;
