var _ = require('lodash');

var test = require('../test');

describe('config',function(){
  var config = null;

  beforeEach(function () {
    test.mockery.enable();
    test.mockery.registerAllowables(['lodash',test.configGuard.requirePath]);
    test.mockery.warnOnReplace(false);
    test.mockery.registerMock('./helpers', test.mockHelpers);
    test.mockery.registerMock('./logger',test.mockLogger);

    test.mockLogger.resetMock();
    test.mockHelpers.resetMock();

    config = test.configGuard.beginGuarding();
    config.resetLoggerAndHelpers();
    config.reset();

    test.mockLogger.resetMock();
    test.mockHelpers.resetMock();
  });

  afterEach(function () {
    test.configGuard.finishGuarding();
    test.mockHelpers.checkMockFiles();
    test.mockLogger.checkMockLogEntries();
    test.mockery.disable();
  });

  describe('reset',function(){
    it('should turn off debugging by default and reload the file',function(){
      test.mockLogger.debugging = true;
      test.mockLogger.debugging.should.be.ok;

      config.reset();
      test.mockLogger.debugging.should.not.be.ok;
      test.mockHelpers.checkMockFiles([[config.config_file,'default']]);
    });
  });

  describe('update',function(){
    it('should not save any default values in the config file',function(){
      config.update(config.settings);

      test.mockHelpers.checkMockFiles([[config.config_file,'default']]);
    });

    it('should save any non-default values in the config file',function(){
      config.update({test: true});

      test.mockHelpers.checkMockFiles([[config.config_file,'default'],[config.config_file,'success']],[[config.config_file,{test: true}]]);

      delete config.settings.test;
    });

    it('should keep save any existing values in the config file',function(){
      test.mockHelpers.filesToRead[config.config_file] = {existing: 'test'};

      config.update({existing: 'test',test: true});

      test.mockHelpers.checkMockFiles([[config.config_file,'success'],[config.config_file,'success']],[[config.config_file,{test: true,existing: 'test'}]]);

      delete config.settings.test;
      delete config.settings.existing;
    });

    it('should save any changed values in the config file',function(){
      test.mockHelpers.filesToRead[config.config_file] = {test: false};

      test.mockLogger.debugging = true;

      config.update({test: true});

      test.mockHelpers.checkMockFiles([[config.config_file,'success'],[config.config_file,'success']],[[config.config_file,{test: true}]]);
      test.mockLogger.checkMockLogEntries(['DEBUG - update config: {"test":true}']);

      delete config.settings.test;
    });
  });
});