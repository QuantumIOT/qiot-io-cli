var _ = require('lodash');

var test = require('../test');

var accounts = require(process.cwd() + '/cmds/accounts');

describe('Command: accounts',function() {
  var config = null;
  var mockHTTP = null;

  beforeEach(function () {
    config = test.standardBeforeEach(['commander','prompt']);

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
  });

  afterEach(test.standardAfterEach);

  it('should handle an HTTP error code',function(done){
    mockHTTP.statusCode = 403;

    accounts({},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql(['Forbidden']);

        test.mockLogger.checkMockLogEntries([
          'DEBUG - host GET: null',
          'DEBUG - host status: Forbidden'
        ]);

        done();
      });
    });
  });

  it('should print accounts to console on success',function(done){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',accounts: [{id: 1,name: 'test',token_identifier: 'ID',token_secret: 'SECRET',account_token: 'TOKEN'}]});

    accounts({},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.mockLogger.checkMockLogEntries([
          'DEBUG - host GET: null',
          'DEBUG - host output: {\"status\":\"success\",\"accounts\":[{\"id\":1,\"name\":\"test\",\"token_identifier\":\"ID\",\"token_secret\":\"SECRET\",\"account_token\":\"TOKEN\"}]}',
          'DEBUG - host status: OK',
          [ ' id   name   token_identifier   token_secret   account_token \n',
            '──── ────── ────────────────── ────────────── ───────────────\n',
            ' 1    test   ID                 SECRET         TOKEN         \n'
          ].join('')
        ]);

        done();
      });
    });
  });

});