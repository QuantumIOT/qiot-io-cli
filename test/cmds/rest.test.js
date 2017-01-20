var _ = require('lodash');

var test = require('../test');

var rest = require(process.cwd() + '/cmds/rest');

describe('Command: rest',function() {
  var config = null;
  var mockHTTP = null;
  var commander = null;

  beforeEach(function () {
    config = test.standardBeforeEach(['prompt']);

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  it('should handle an HTTP error code',function(done){
    mockHTTP.statusCode = 403;

    rest('POST','/test',JSON.stringify({action: 'test'}),function(result){
      test.safeAssertions(done,function(){
        [result].should.eql(['Forbidden']);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) POST /test : {"action":"test"}',
          'DEBUG - host status: Forbidden'
        ]);

        done();
      });
    });
  });

  it('should receive a successful response',function(done){
    mockHTTP.dataToRead = JSON.stringify({action: 'test'});

    rest('GET','/test',null,function(result){
      test.safeAssertions(done,function(){
        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /test : null',
          'DEBUG - host output: {"action":"test"}',
          'DEBUG - host status: OK',
          ' action   test \n'
        ]);

        done();
      });
    });
  });

});