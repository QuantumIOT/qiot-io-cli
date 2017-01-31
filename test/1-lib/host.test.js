var test = require('../test');

var HOST = require(process.cwd() + '/lib/host');

describe('HOST',function() {
  var config,mockHTTP,host;

  beforeEach(function(){
    config = test.standardBeforeEach();

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());

    host = new HOST();
  });

  afterEach(test.standardAfterEach);

  describe('request',function(){
    it('receives multiple data chunks',function(done){
      mockHTTP.dataToRead = ['{"action":','"test"}'];

      host.request({path: '/test'},null).then(function(result){
        result.data.should.eql({action: 'test'});
        
        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /test : null',
          'DEBUG - host output: {"action":',
          'DEBUG - host output: "test"}',
          'DEBUG - host status: OK'
        ]);
        
        done();
      },done)
    });

    it('handles an initial error',function(done){
      mockHTTP.dataToRead = [null,null];

      host.request({path: '/test'},null).then(function(){ done('unexpected success'); },function(error){
        test.safeAssertions(done,function(){
          error.toString().should.eql("TypeError: Cannot read property 'toString' of null");
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /test : null',
            'DEBUG - host status: OK'
          ]);
          done();
        });
      })
    });

    it('handles a chunk error',function(done){
      mockHTTP.dataToRead = ['test',null];

      host.request({path: '/test'},null).then(function(){ done('unexpected success'); },function(error){
        test.safeAssertions(done,function(){
          error.toString().should.eql("TypeError: Cannot read property 'toString' of null");
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /test : null',
            'DEBUG - host output: test',
            'DEBUG - host status: OK'
          ]);
          done();
        });
      })
    });
  });

});