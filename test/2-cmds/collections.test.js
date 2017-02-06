var _ = require('lodash');

var test = require('../test');

var collections = require(process.cwd() + '/cmds/collections');

describe('Command: collections',function() {
  var config = null;
  var mockHTTP = null;
  var commander = null;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  describe('when not account option is set',function(){
    it('should require the option',function(){
      collections(function(result){
        [result].should.eql(['no account found']);
      });
    });
  });

  describe('when an account option is set',function(){
    beforeEach(function(){
      commander.account = 'ACCOUNT';
    });

    it('should handle an HTTP error code',function(done){
      mockHTTP.statusCode = 403;

      collections({},function(result){
        test.safeAssertions(done,function(){

          [result].should.eql(['Forbidden']);

          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /users/accounts/ACCOUNT/collections : null',
            'DEBUG - host status: Forbidden'
          ]);

          done();
        });
      });
    });

    it('should print collections to console on success',function(done){
      mockHTTP.dataToRead = JSON.stringify({status: 'success',collections: [{id: 1,name: 'test',auth_token: 'TOKEN'}]});

      collections({},function(result){
        test.safeAssertions(done,function(){

          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /users/accounts/ACCOUNT/collections : null',
            'DEBUG - host output: {"status":"success","collections":[{"id":1,"name":"test","auth_token":"TOKEN"}]}',
            'DEBUG - host status: OK',
            [ ' id   name   auth_token \n',
              '──── ────── ────────────\n',
              ' 1    test   TOKEN      \n'
            ].join('')
          ]);

          done();
        });
      });
    });
  });

});