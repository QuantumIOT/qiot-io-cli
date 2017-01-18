var _ = require('lodash');
var prompt = require('prompt');
var regexEmail = require('regex-email');

var test = require('../test');

var signin = require(process.cwd() + '/cmds/signin');

describe('Command: signin',function() {
  var config = null;
  var commander = null;
  var promptStub = null;
  var mockHTTP = null;

  beforeEach(function () {
    test.mockery.enable();
    test.mockery.warnOnReplace(false);
    test.mockery.registerAllowables(['lodash','prompt','./config',test.configGuard.requirePath]);
    test.mockery.registerMock('./logger', test.mockLogger);
    test.mockLogger.resetMock();
    test.mockery.registerMock('./helpers',test.mockHelpers);
    test.mockHelpers.resetMock();
    test.mockery.registerMock('commander',commander = {});
    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());

    config = test.configGuard.beginGuarding();
    test.mockHelpers.resetMock();

    // test.mockLogger.debugging = true;

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

  function standardSetupMockHTTP(){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',token: 'TOKEN'});
  }

  function standardAssertMockHTTP(){
    _.keys(mockHTTP.eventCallbacks).should.eql(['request','error','data','end']);
    mockHTTP.dataWritten.should.eql([
      'request={"method":"POST","host":"qiot.io","port":443,"path":"/users/signin","headers":{"Content-Type":"application/json","Content-Length":48}}',
      'write={"email":"test@test.com","password":"testing!!"}',
      'end'
    ]);

    test.mockHelpers.checkMockFiles(
      [[config.config_file,'default'],[config.config_file,'success']],
      [[config.config_file,{auth_token: 'TOKEN'}]]);
    test.mockLogger.checkMockLogEntries();

    delete config.settings.auth_token;
  }

  describe('when all commander options are given',function(){
    beforeEach(function(){
      commander.user = 'test@test.com';
      commander.password = 'testing!!';
    });

    it('does not prompt the user',function(done){
      standardSetupMockHTTP();

      signin(commander,null);
      setTimeout(function(){
        test.safeAssertions(done,function(){
          promptStub.getCalls().length.should.eql(0);

          standardAssertMockHTTP();

          done();
        });
      },10); // NOTE - avoid passing "done" to "signin" to exercize code paths...
    });

    it('accepts an HTTP error',function(done){
      mockHTTP.statusCode = 403;

      signin(commander,function(result){
        test.safeAssertions(done,function(){

          promptStub.getCalls().length.should.eql(0);

          [result].should.eql(['unsuccessful signin: Forbidden']);

          done();
        });
      });
    });
  });

  describe('when no commander options given',function(){
    it('captures prompt errors',function(done){
      promptStub.onFirstCall().callsArgWith(1,'test error');

      signin(commander);

      test.deferAssertions(done,function(){
        promptStub.getCalls().length.should.eql(1);
        test.mockLogger.checkMockLogEntries(['ERROR - test error']);
        done();
      })

    });

    it('should prompt for email and password',function(done){
      standardSetupMockHTTP();

      promptStub.onFirstCall().callsArgWith(1,null,{email: 'test@test.com'});
      promptStub.onSecondCall().callsArgWith(1,null,{password: 'testing!!'});

      signin(commander,function(error){
        test.safeAssertions(done,function(){
          [error].should.eql([null]);
          commander.should.eql({email: 'test@test.com',password: 'testing!!'});

          promptStub.getCalls().length.should.eql(2);
          promptStub.getCall(0).args[0].should.eql([{name: 'email',   required: true,pattern: regexEmail}]);
          promptStub.getCall(1).args[0].should.eql([{name: 'password',required: true,hidden: true}]);

          standardAssertMockHTTP();

          done();
        })
      });
    });
  });

});