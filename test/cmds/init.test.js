var prompt = require('prompt');

var test = require('../test');

var init = require(process.cwd() + '/cmds/init');

describe('Command: init',function() {
  var config = null;
  var promptStub = null;

  beforeEach(function () {

    test.mockery.enable();
    test.mockery.warnOnReplace(false);
    test.mockery.registerAllowables(['lodash','commander','prompt','./config',test.configGuard.requirePath]);
    test.mockery.registerMock('./logger', test.mockLogger);
    test.mockLogger.resetMock();
    test.mockery.registerMock('./helpers',test.mockHelpers);
    test.mockHelpers.resetMock();

    config = test.configGuard.beginGuarding();
    test.mockHelpers.resetMock();

    test.mockLogger.debugging = true;

    promptStub = test.sinon.stub(prompt,'get');
  });

  afterEach(function () {
    promptStub.restore();

    test.mockLogger.debugging = false;
    test.configGuard.finishGuarding();
    test.mockHelpers.checkMockFiles();
    test.mockLogger.checkMockLogEntries();
    test.mockery.deregisterAll();
    test.mockery.disable();
  });

  it('should prompt the user for standard config items',function(){
    init();

    promptStub.getCalls().length.should.eql(1);
    promptStub.getCall(0).args[0].should.eql([
      {
        default: false,
        description: 'debug mode',
        name: 'debug',
        type: 'boolean'
      },
      {
        default: 'qiot.io',
        description: 'host DNS',
        name: 'host_dns'
      }
    ]);
  });

  it('should handle a prompt error',function(){
    init({},null);

    promptStub.callArgWith(1,'test error');

    test.mockHelpers.checkMockFiles([]);
    test.mockLogger.checkMockLogEntries(['ERROR - test error']);
  });

  it('should not change the config when all defaults are accepted',function(){
    init({},null);

    promptStub.callArgWith(1,null,{debug: false,host_dns: 'qiot.io'});

    config.settings.debug.should.eql(false);
    config.settings.host_dns.should.eql('qiot.io');

    test.mockHelpers.checkMockFiles([[config.config_file,'default']]);
    test.mockLogger.checkMockLogEntries([]);
  });

  it('should change the config when all values are given',function(done){
    init({},done);

    promptStub.callArgWith(1,null,{debug: true,host_dns: 'TEST'});

    config.settings.debug.should.eql(true);
    config.settings.host_dns.should.eql('TEST');

    config.settings.debug = config.defaults.debug;
    config.settings.host_dns = config.defaults.host_dns;

    test.mockHelpers.checkMockFiles([[config.config_file,'default'],[config.config_file,'success']],[[config.config_file,{debug: true,host_dns: 'TEST'}]]);
    test.mockLogger.checkMockLogEntries(['DEBUG - update config: {"debug":true,"host_dns":"TEST"}']);
  });

});