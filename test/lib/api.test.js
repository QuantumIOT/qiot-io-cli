var test = require('../test');

var API = require(process.cwd() + '/lib/api');

describe('API',function() {
  var config,commander,mockHTTP;

  beforeEach(function(){
    config = test.standardBeforeEach(['prompt']);

    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
  });

  afterEach(test.standardAfterEach);

  describe('executeDefn',function(){
    it('detects no definition given',function(){
      API.executeDefn([],null);

      test.loggerCheckEntries(['ERROR - no definition given']);
    });

    it('detects missing data fields',function(done){
      var enclosure = function(){ API.executeDefn(arguments,API.findDefn({command: 'users'})); };

      enclosure(function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['missing data: users']);
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /users : null',
            'DEBUG - host status: OK'
          ]);
          done();
        });
      });
    });
  });

});