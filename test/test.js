var _ = require('lodash');

var logger = require(process.cwd() + '/lib/logger');
var helpers = require(process.cwd() + '/lib/helpers');

var test = {};

test.TEST_USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6InN1cGVyYWRtaW5AcXVhbnR1bWlvdC5jb20iLCJvYXV0aF9wcm92aWRlciI6bnVsbCwiYXV0aF90eXBlIjoicGFzc3dvcmQiLCJjcmVhdGVkX2F0IjoiMjAxNy0wMS0wN1QxODo0MDo0NC4zNjRaIiwidXBkYXRlZF9hdCI6IjIwMTctMDEtMDdUMTg6NDA6NDQuMzY0WiIsImFjY291bnRfaWQiOm51bGwsInRlYW1faWQiOm51bGwsInJvbGVfaWQiOjIsInJvbGUiOnsiaWQiOjIsIm5hbWUiOiJzdXBlci1hZG1pbiJ9LCJpYXQiOjE0ODUwMTA3MzIsImV4cCI6MTQ4NTYxNTUzMn0.s5nOvajl8d5eMTI4xm1DkLmDkzZz-zHlYPyNt5DJH7k';

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
  test.mockery.registerAllowables(_.concat(allowed || [],['lodash','./config','./logger',test.configGuard.requirePath]));
  test.loggerBeforeEach();
  test.mockery.registerMock('./helpers',test.mockHelpers);
  test.mockHelpers.resetMock();

  var config = test.configGuard.beginGuarding();
  test.mockHelpers.resetMock();

  logger.debugging = true;

  return config;
};

test.standardAfterEach = function(){
  logger.debugging = false;

  test.configGuard.finishGuarding();

  test.mockHelpers.checkMockFiles();
  test.loggerAfterEach();
  test.mockery.deregisterAll();
  test.mockery.disable();
};

var logEntriesSeen = 0;
var loggerStub = null;

test.loggerBeforeEach = function(){
  logger.timestamp = false;
  logEntriesSeen = 0;
  loggerStub = test.sinon.stub(logger,'consoleLOG').returns();
};

test.loggerAfterEach = function(){
  test.loggerCheckEntries();
  loggerStub.restore();
  loggerStub = null;
  logger.timestamp = true;
};

test.loggerCheckEntries = function(expected){
  var actuals = [];
  var calls = loggerStub.getCalls();

  while (logEntriesSeen < calls.length)
    actuals.push(calls[logEntriesSeen++].args[0]);

  actuals.should.eql(expected || []);
};

test.loggerResetEntries = function(){
  logEntriesSeen = loggerStub.getCalls().length;
};

// CONFIG GUARD

var ConfigGuard = {requirePath: process.cwd() + '/lib/config'};

ConfigGuard.beginGuarding = function(){
  ConfigGuard.config = require(ConfigGuard.requirePath);

  if (!ConfigGuard.previous) ConfigGuard.previous = JSON.stringify(ConfigGuard.config.settings);

  return ConfigGuard.config;
};

ConfigGuard.finishGuarding = function(){
  JSON.parse(JSON.stringify(ConfigGuard.config.settings)).should.eql(JSON.parse(ConfigGuard.previous));
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
      _.each(_.concat([],self.dataToRead || []),self.eventCallbacks.data);
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
