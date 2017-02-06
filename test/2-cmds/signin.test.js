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
    config = test.standardBeforeEach();

    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());

    promptStub = test.sinon.stub(prompt,'get');
  });

  afterEach(function () {
    promptStub.restore();

    test.standardAfterEach();
  });

  function standardSetupMockHTTP(){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',token: test.TEST_USER_TOKEN});
  }

  function standardAssertMockHTTP(){
    test.loggerCheckEntries([
      'DEBUG - host (qiot.io) POST /users/signin : {"email":"test@test.com","password":"testing!!"}',
      'DEBUG - host output: {"status":"success","token":"' + test.TEST_USER_TOKEN + '"}',
      'DEBUG - host status: OK',
      'DEBUG - update config: {"user_token":"' + test.TEST_USER_TOKEN + '","current_user":8,"current_account":null}',
      [
        ' id                8                         \n',
        ' name              superadmin                \n',
        ' email             superadmin@quantumiot.com \n',
        ' oauth_provider                              \n',
        ' auth_type         password                  \n',
        ' created_at        2017-01-07T18:40:44.364Z  \n',
        ' updated_at        2017-01-07T18:40:44.364Z  \n',
        ' account_id                                  \n',
        ' team_id                                     \n',
        ' role_id           2                         \n',
        ' role.id           2                         \n',
        ' role.name         super-admin               \n',
        ' iat               1485010732                \n',
        ' exp               1485615532                \n',
        ' current_user      8                         \n',
        ' current_account                             \n'
      ].join('')
    ]);

    _.keys(mockHTTP.eventCallbacks).should.eql(['request','error','data','end']);
    mockHTTP.dataWritten.should.eql([
      'request={"method":"POST","host":"qiot.io","port":443,"path":"/users/signin","headers":{"Content-Type":"application/json","Content-Length":48}}',
      'write={"email":"test@test.com","password":"testing!!"}',
      'end'
    ]);

    test.mockHelpers.checkMockFiles(
      [[config.config_file,'default'],[config.config_file,'success']],
      [[config.config_file,{user_token: test.TEST_USER_TOKEN,current_user: 8,current_account: null}]]
    );

    delete config.settings.user_token;
    delete config.settings.current_user;
    delete config.settings.current_account;
  }

  describe('when all command line arguments are given',function(){
    it('does not prompt the user',function(done){
      standardSetupMockHTTP();

      signin('test@test.com','testing!!');

      setTimeout(function(){
        test.safeAssertions(done,function(){
          promptStub.getCalls().length.should.eql(0);

          standardAssertMockHTTP();

          done();
        });
      },10); // NOTE - avoid passing "done" to "signin" to exercize code paths...
    });

    it('detects an invalid email',function(){
      signin('test','testing!!',function(result){
        [result].should.eql(['invalid email address'])
      });
    });

    it('accepts an HTTP error',function(done){
      mockHTTP.statusCode = 403;

      signin('test@test.com','testing!!',function(result){
        test.safeAssertions(done,function(){

          promptStub.getCalls().length.should.eql(0);

          [result].should.eql(['Forbidden']);

          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) POST /users/signin : {"email":"test@test.com","password":"testing!!"}',
            'DEBUG - host status: Forbidden'
          ]);

          done();
        });
      });
    });
  });

  describe('when no commander options given',function(){
    it('captures prompt errors',function(done){
      promptStub.onFirstCall().callsArgWith(1,'test error');

      signin(null,null);

      test.deferAssertions(done,function(){
        promptStub.getCalls().length.should.eql(1);
        test.loggerCheckEntries(['ERROR - test error']);
        done();
      })

    });

    it('should prompt for email and password',function(done){
      standardSetupMockHTTP();

      promptStub.onFirstCall().callsArgWith(1,null,{email: 'test@test.com'});
      promptStub.onSecondCall().callsArgWith(1,null,{password: 'testing!!'});

      signin(null,null,function(error){
        test.safeAssertions(done,function(){
          [error].should.eql([null]);
          commander.should.eql({email: 'test@test.com',password: 'testing!!',raw: true});

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