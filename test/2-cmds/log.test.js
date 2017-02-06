var _ = require('lodash');

var test = require('../test');

var log = require(process.cwd() + '/cmds/log');

describe('Command: log',function() {
  var config,commander,mockHTTP;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
  });

  afterEach(test.standardAfterEach);

  describe('when not account_token exists',function(){
    it('should report an error',function(done){
      mockHTTP.statusCode = 401;
      mockHTTP.dataToRead = 'No Authorization header found';

      log('THING',JSON.stringify({action: 'test'}),function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Unauthorized: No Authorization header found']);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/l/THING : {"action":"test"}',
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

      log('THING',JSON.stringify({action: 'test'}),function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);

          mockHTTP.dataWritten.should.eql([
            'request={"method":"POST","host":"api.qiot.io","port":443,"path":"/1/l/THING","headers":{"Content-Type":"application/json","Authorization":"QIOT ACCOUNT-TOKEN","Content-Length":17}}',
            'write={"action":"test"}',
            'end'
          ]);
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