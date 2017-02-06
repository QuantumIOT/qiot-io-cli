var _ = require('lodash');
var prompt = require('prompt');

var test = require('../test');

var init = require(process.cwd() + '/cmds/init');

describe('Command: init',function() {
  var config = null;
  var promptStub = null;

  beforeEach(function () {
    config = test.standardBeforeEach(['commander']);

    promptStub = test.sinon.stub(prompt,'get');
  });

  afterEach(function () {
    promptStub.restore();

    test.standardAfterEach();
  });

  it('should handle a prompt error',function(){
    init({});

    promptStub.callArgWith(1,'test error');

    test.mockHelpers.checkMockFiles([]);
    test.loggerCheckEntries(['ERROR - test error']);
  });

  it('should not change the config when all defaults are accepted',function(){
    init({});

    promptStub.callArgWith(1,null,{debug: false,host_dns: 'qiot.io'});

    config.settings.debug.should.eql(false);
    config.settings.host_dns.should.eql('qiot.io');

    test.mockHelpers.checkMockFiles([[config.config_file,'default']]);
    test.loggerCheckEntries([]);
  });

  it('should change the config when all values are given',function(){
    init({});

    var allArgs = {debug: true,host_dns: 'TEST',account_token: 'ACCOUNT-TOKEN',user_token: 'AUTH-TOKEN'};
    promptStub.callArgWith(1,null,_.clone(allArgs));

    config.settings.debug.should.eql(true);
    config.settings.host_dns.should.eql('TEST');

    config.settings.debug = config.defaults.debug;
    config.settings.host_dns = config.defaults.host_dns;

    test.mockHelpers.checkMockFiles([[config.config_file,'default'],[config.config_file,'success']],[[config.config_file,allArgs]]);
    test.loggerCheckEntries(['DEBUG - update config: {"debug":true,"host_dns":"TEST","account_token":"ACCOUNT-TOKEN","user_token":"AUTH-TOKEN"}']);

    delete config.settings.account_token;
    delete config.settings.user_token;
  });

  describe('when displaying an abbreviation',function(){
    var originalToken = 'AUTH-01234567890-01234567890-01234567890-01234567890-01234567890-01234567890-01234567890-01234567890';
    var abbreviation = 'AUTH-01234567890-01234...1234567890-01234567890';

    beforeEach(function(){
      config.settings.user_token = originalToken;
    });

    afterEach(function(){
      delete config.settings.account_token;
      delete config.settings.user_token;
    });

    it('should never save an abbreviation',function(){

      init({});

      promptStub.getCall(0).args[0][4].should.eql({
        default: abbreviation,
        description: 'user token',
        name: 'user_token'
      });

      var allArgs = {debug: config.defaults.debug,host_dns: config.defaults.host_dns,account_token: config.defaults.account_token,user_token: abbreviation};
      promptStub.callArgWith(1,null,_.clone(allArgs));

      test.mockHelpers.checkMockFiles([[config.config_file,'default']]);
    });

    it('should override user_token after displaying an abbreviation',function(){
      var originalToken = 'AUTH-01234567890-01234567890-01234567890-01234567890-01234567890-01234567890-01234567890-01234567890';
      config.settings.user_token = originalToken;

      init({});

      promptStub.getCall(0).args[0][4].should.eql({
        default: 'AUTH-01234567890-01234...1234567890-01234567890',
        description: 'user token',
        name: 'user_token'
      });

      var allArgs = {debug: config.settings.debug,host_dns: config.settings.host_dns,account_token: config.settings.account_token,user_token: 'AUTH-TOKEN'};
      promptStub.callArgWith(1,null,_.clone(allArgs));

      test.mockHelpers.checkMockFiles([[config.config_file,'default'],[config.config_file,'success']],[[config.config_file,{user_token: 'AUTH-TOKEN'}]]);
      test.loggerCheckEntries(['DEBUG - update config: {"user_token":"AUTH-TOKEN"}']);
    });

  });

  describe('when there are settings that do not match defaults',function(){
    beforeEach(function(){
      config.settings.debug = true;
      config.settings.host_service = 'http';
      config.settings.host_port = 3000;
      config.settings.host_dns = 'ABC';
      config.settings.proxy_dns = 'XYZ';
      config.settings.mqtt_port = 3000;
      config.settings.users_prefix = false;
      config.settings.account_token = '123';
      config.settings.user_token = '456';
      config.settings.current_account = '789';
      config.settings.current_collection = '012';
      config.settings.current_user = '345';
      test.mockHelpers.filesToRead[config.config_file] = config.settings;
    });

    afterEach(function(){
      config.update(config.defaults);
      test.mockHelpers.resetMock();
      test.loggerResetEntries();
    });

    it('should reset all settings to defaults',function(){
      init({reset: true});

      config.settings.should.eql(config.defaults);

      test.mockHelpers.checkMockFiles([[config.config_file,'success'],[config.config_file,'success']],[[config.config_file,{}]]);
      test.loggerCheckEntries(['DEBUG - update config: {}']);
    });

    it('should prompt the user with default values',function(){
      init({defaults: true});

      promptStub.getCalls().length.should.eql(1);
      promptStub.getCall(0).args[0].should.eql([
        {
          default: config.defaults.debug,
          description: 'debug mode',
          name: 'debug',
          type: 'boolean'
        },
        {
          default: config.defaults.host_dns,
          description: 'host DNS',
          name: 'host_dns'
        },
        {
          default: config.defaults.proxy_dns,
          description: 'thing proxy DNS',
          name: 'proxy_dns'
        },
        {
          default: config.defaults.account_token,
          description: 'account token',
          name: 'account_token'
        },
        {
          default: config.defaults.user_token,
          description: 'user token',
          name: 'user_token'
        }
      ]);

      test.mockHelpers.checkMockFiles();
      test.loggerCheckEntries();
    });

    it('should prompt the user for current config items',function(){
      init({});

      promptStub.getCalls().length.should.eql(1);
      promptStub.getCall(0).args[0].should.eql([
        {
          default: config.settings.debug,
          description: 'debug mode',
          name: 'debug',
          type: 'boolean'
        },
        {
          default: config.settings.host_dns,
          description: 'host DNS',
          name: 'host_dns'
        },
        {
          default: config.settings.proxy_dns,
          description: 'thing proxy DNS',
          name: 'proxy_dns'
        },
        {
          default: config.settings.account_token,
          description: 'account token',
          name: 'account_token'
        },
        {
          default: '456...456',
          description: 'user token',
          name: 'user_token'
        }
      ]);

      test.mockHelpers.checkMockFiles();
      test.loggerCheckEntries();
    });
  });

});