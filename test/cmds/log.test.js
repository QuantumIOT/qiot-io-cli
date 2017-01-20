var _ = require('lodash');

var test = require('../test');

var log = require(process.cwd() + '/cmds/log');

describe('Command: log',function() {
  var config = null;
  var mockHTTP = null;

  beforeEach(function () {
    config = test.standardBeforeEach(['commander','prompt']);

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
  });

  afterEach(test.standardAfterEach);

  describe('when not account_token exists',function(){
    it('should report an error',function(done){
      log('THING',JSON.stringify({action: 'test'}),function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['no account_token found']);

          test.loggerCheckEntries([]);

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

      log('THING',JSON.stringify({action: 'test'}),function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/l/THING : {"action":"test"}',
            'DEBUG - host status: Forbidden'
          ]);

          done();
        });
      });
    });

    it('should successfully deliver a log message',function(done){
      mockHTTP.statusCode = 204;

      log('THING',JSON.stringify({action: 'test'}),function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/l/THING : {"action":"test"}',
            'DEBUG - host status: No Content'
          ]);

          done();
        });
      });
    });
  });

});