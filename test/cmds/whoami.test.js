var prompt = require('prompt');

var test = require('../test');

var whoami = require(process.cwd() + '/cmds/whoami');

describe('Command: whoami',function() {
  var config = null;

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
  });

  afterEach(function () {
    test.mockLogger.debugging = false;
    test.configGuard.finishGuarding();
    test.mockHelpers.checkMockFiles();
    test.mockLogger.checkMockLogEntries();
    test.mockery.deregisterAll();
    test.mockery.disable();
  });

  describe('when no auth_token exists',function(){
    it('should report there is no current user',function(done){
      whoami({},function(){
        test.mockLogger.checkMockLogEntries(['ERROR - no current user']);
        done();
      });
    })
  });

  describe('when no auth_token exists',function(){
    beforeEach(function(){
      config.settings.auth_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6InN1cGVyYWRtaW5AcXVhbnR1bWlvdC5jb20iLCJyZW1vdGVfaWQiOm51bGwsIm9hdXRoX3Byb3ZpZGVyIjpudWxsLCJvYXV0aF90b2tlbl90eXBlIjpudWxsLCJvYXV0aF9hY2Nlc3NfdG9rZW4iOm51bGwsIm9hdXRoX3Njb3BlIjpudWxsLCJjcmVhdGVkX2F0IjoiMjAxNy0wMS0wN1QxODo0MDo0NC4zNjRaIiwidXBkYXRlZF9hdCI6IjIwMTctMDEtMDdUMTg6NDA6NDQuMzY0WiIsImFjY291bnRfaWQiOm51bGwsInJvbGVfaWQiOjIsInBhc3N3b3JkX2hhc2giOiIkMmEkMTAkQ1dHTUJsV0R3TC5yNldhczRXSUpwT3Zjb2dLSlEzRmpCVGxzNlNWT3lwWlBoMkhadDBsb1MiLCJwYXNzd29yZF9zYWx0IjoiJDJhJDEwJENXR01CbFdEd0wucjZXYXM0V0lKcE8iLCJhdXRoX3R5cGUiOiJwYXNzd29yZCIsInRlYW1faWQiOm51bGwsInJvbGUiOnsiaWQiOjIsIm5hbWUiOiJzdXBlci1hZG1pbiJ9LCJpYXQiOjE0ODQ3NjMxNDksImV4cCI6MTQ4NTM2Nzk0OX0.dclfHnVn7aDoxMEf4ccQhWBIJpH2lKFhLLTOTumInWM';
    });

    afterEach(function(){
      delete config.settings.auth_token;
    });

    it('should report there is no current user',function(){
      whoami();

      test.mockLogger.checkMockLogEntries([
        'id:\t8',
        'name:\tsuperadmin',
        'email:\tsuperadmin@quantumiot.com',
        'remote_id:\tnull',
        'oauth_provider:\tnull',
        'oauth_token_type:\tnull',
        'oauth_access_token:\tnull',
        'oauth_scope:\tnull',
        'created_at:\t2017-01-07T18:40:44.364Z',
        'updated_at:\t2017-01-07T18:40:44.364Z',
        'account_id:\tnull',
        'role_id:\t2',
        'password_hash:\t$2a$10$CWGMBlWDwL.r6Was4WIJpOvcogKJQ3FjBTls6SVOypZPh2HZt0loS',
        'password_salt:\t$2a$10$CWGMBlWDwL.r6Was4WIJpO',
        'auth_type:\tpassword',
        'team_id:\tnull',
        'role.id:\t2',
        'role.name:\tsuper-admin',
        'iat:\t1484763149',
        'exp:\t1485367949'
      ]);
    })
  });

});