var _ = require('lodash');

var test = require('../test');

var mailbox = require(process.cwd() + '/cmds/mailbox');

describe('Command: mailbox',function() {
  var config = null;
  var mockHTTP = null;
  var commander = null;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  describe('when receiving a mailbox message',function(){

    describe('when not account_token exists',function(){
      it('should report an error',function(done){
        mockHTTP.statusCode = 401;
        mockHTTP.dataToRead = 'No Authorization header found';

        mailbox('THING',null,{},function(result){
          test.safeAssertions(done,function(){
            [result].should.eql(['Unauthorized: No Authorization header found']);

            test.loggerCheckEntries([
              'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
              'DEBUG - host output: No Authorization header found',
              'DEBUG - host status: Unauthorized'
            ]);

            done();
          });
        });
      });
    });

    describe('when an account_token exists',function(){
      beforeEach(function(){
        config.settings.account_token = 'ACCOUNT-TOKEN';
      });

      afterEach(function(){
        delete config.settings.account_token;
      });

      it('should handle an HTTP error code',function(done){
        mockHTTP.statusCode = 403;

        mailbox('THING',null,function(result){
          test.safeAssertions(done,function(){
            [result].should.eql(['Forbidden']);

            test.loggerCheckEntries([
              'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
              'DEBUG - host status: Forbidden'
            ]);

            done();
          });
        });
      });

      it('should successfully deliver a mailbox message',function(done){
        mockHTTP.dataToRead = JSON.stringify({action: 'test'});

        mailbox('THING',null,{},function(result){
          test.safeAssertions(done,function(){
            [result].should.eql([null]);

            test.loggerCheckEntries([
              'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
              'DEBUG - host output: {"action":"test"}',
              'DEBUG - host status: OK',
              ' action   test \n'
            ]);

            done();
          });
        });
      });
    });

  });

  describe('when sending a mailbox message',function(){
    describe('when not account_token exists',function(){
      it('should report an error',function(done){
        mockHTTP.statusCode = 401;
        mockHTTP.dataToRead = 'No Authorization header found';

        mailbox('THING',JSON.stringify({action: 'test'}),{},function(result){
          test.safeAssertions(done,function(){
            [result].should.eql(['Unauthorized: No Authorization header found']);

            test.loggerCheckEntries([
              'DEBUG - host (api.qiot.io) POST /1/m/THING : {"action":"test"}',
              'DEBUG - host output: No Authorization header found',
              'DEBUG - host status: Unauthorized'
            ]);

            done();
          });
        });
      });
    });

    describe('when an account_token exists',function(){
      beforeEach(function(){
        config.settings.account_token = 'ACCOUNT-TOKEN';
      });

      afterEach(function(){
        delete config.settings.account_token;
      });

      it('should handle an HTTP error code',function(done){
        mockHTTP.statusCode = 403;

        mailbox('THING',JSON.stringify({action: 'test'}),{},function(result){
          test.safeAssertions(done,function(){
            [result].should.eql(['Forbidden']);

            test.loggerCheckEntries([
              'DEBUG - host (api.qiot.io) POST /1/m/THING : {"action":"test"}',
              'DEBUG - host status: Forbidden'
            ]);

            done();
          });
        });
      });

      it('should successfully deliver a mailbox message',function(done){
        mockHTTP.statusCode = 204;

        mailbox('THING',JSON.stringify({action: 'test'}),{},function(result){
          test.safeAssertions(done,function(){
            [result].should.eql([null]);

            test.loggerCheckEntries([
              'DEBUG - host (api.qiot.io) POST /1/m/THING : {"action":"test"}',
              'DEBUG - host status: No Content'
            ]);

            done();
          });
        });
      });
    });

  });

});