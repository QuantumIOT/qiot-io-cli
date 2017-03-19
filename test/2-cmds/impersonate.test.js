var _ = require('lodash');

var test = require('../test');

var impersonate = require(process.cwd() + '/cmds/impersonate');

describe('Command: impersonate',function() {
  var config = null;
  var commander = null;
  var mockHTTP = null;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
  });

  afterEach(test.standardAfterEach);

  function standardSetupMockHTTP(){
    config.settings.user_token = 'USER-TOKEN';
    mockHTTP.dataToRead = JSON.stringify({status: 'success',token: test.TEST_USER_TOKEN});
  }

  function standardAssertMockHTTP(path){
    test.loggerCheckEntries([
      'DEBUG - host (qiot.io) PUT '+ path + ' : null',
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

    mockHTTP.dataWritten.should.eql([
      'request={"method":"PUT","host":"qiot.io","port":443,"path":"'+ path + '","headers":{"Content-Type":"application/json","Authorization":"Bearer USER-TOKEN"}}',
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

  describe('when no userid given',function(){
    it('should handle invalid access',function(done){
      mockHTTP.statusCode = 403;

      impersonate(null,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) PUT /users/users/reload : null',
            'DEBUG - host status: Forbidden'
          ]);
          done();
        })
      });
    });

    it('should handle a valid token',function(done){
      standardSetupMockHTTP();

      impersonate(null,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          standardAssertMockHTTP('/users/users/reload');
          done();
        })
      });
    })
  });

  describe('when userid given',function(){
    it('can handle invalid access',function(done){
      mockHTTP.statusCode = 403;

      impersonate(1,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) PUT /users/users/1/impersonate : null',
            'DEBUG - host status: Forbidden'
          ]);
          done();
        })
      });
    });

    it('should handle a valid token',function(done){
      standardSetupMockHTTP();

      impersonate('1',function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          standardAssertMockHTTP('/users/users/1/impersonate');
          done();
        })
      });
    })
  });

});