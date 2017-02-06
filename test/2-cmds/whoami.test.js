var prompt = require('prompt');
var commander = require('commander');

var test = require('../test');

var whoami = require(process.cwd() + '/cmds/whoami');

describe('Command: whoami',function() {
  var config = null;
  var commander = null;

  beforeEach(function () {
    config = test.standardBeforeEach();
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  describe('when no user_token exists',function(){
    it('should report there is no user_token',function(done){
      whoami({},function(){
        test.loggerCheckEntries([
          'ERROR - no user token',
          [
            ' current_user                   \n',
            ' current_account                \n',
            ' current_collection             \n'
          ].join('')
        ]);
        done();
      });
    })
  });

  describe('when an invalid user_token exists',function(){
    beforeEach(function(){
      config.settings.user_token = 'TOKEN';
    });

    afterEach(function(){
      delete config.settings.user_token;
    });

    it('should report and error',function(done){
      whoami({},function(){
        test.loggerCheckEntries([
          'ERROR - invalid token: TOKEN',
          [
            ' current_user                   \n',
            ' current_account                \n',
            ' current_collection             \n'
          ].join('')
        ]);
        done();
      });
    })
  });

  describe('when a user_token exists',function(){
    beforeEach(function(){
      config.settings.user_token = test.TEST_USER_TOKEN;
    });

    afterEach(function(){
      delete config.settings.user_token;
    });

    it('should list the current user information',function(){
      whoami();

      test.loggerCheckEntries([[
        ' id                   8                         \n',
        ' name                 superadmin                \n',
        ' email                superadmin@quantumiot.com \n',
        ' oauth_provider                                 \n',
        ' auth_type            password                  \n',
        ' created_at           2017-01-07T18:40:44.364Z  \n',
        ' updated_at           2017-01-07T18:40:44.364Z  \n',
        ' account_id                                     \n',
        ' team_id                                        \n',
        ' role_id              2                         \n',
        ' role.id              2                         \n',
        ' role.name            super-admin               \n',
        ' iat                  1485010732                \n',
        ' exp                  1485615532                \n',
        ' current_user                                   \n',
        ' current_account                                \n',
        ' current_collection                             \n'
      ].join('')]);
    })
  });

});