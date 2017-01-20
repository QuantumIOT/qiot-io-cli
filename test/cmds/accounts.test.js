var _ = require('lodash');

var test = require('../test');

var accounts = require(process.cwd() + '/cmds/accounts');

describe('Command: accounts',function() {
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
    mockHTTP.statusCode = 401;
    mockHTTP.dataToRead = 'No Authorization header found';

    accounts({},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql(['Unauthorized: No Authorization header found']);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /users/accounts : null',
          'DEBUG - host output: No Authorization header found',
          'DEBUG - host status: Unauthorized'
        ]);

        done();
      });
    });
  });

  it('should print accounts to console on success',function(done){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',accounts: [{id: 1,name: 'test',token_identifier: 'ID',token_secret: 'SECRET',account_token: 'TOKEN',users: [{id: 123,email: 'test@test.com'}]}]});

    accounts({},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /users/accounts : null',
          'DEBUG - host output: {"status":"success","accounts":[{"id":1,"name":"test","token_identifier":"ID","token_secret":"SECRET","account_token":"TOKEN","users":[{"id":123,"email":"test@test.com"}]}]}',
          'DEBUG - host status: OK',
          [ ' id   name   token_identifier   token_secret   account_token   users.0.id   users.0.email \n',
            '──── ────── ────────────────── ────────────── ─────────────── ──────────── ───────────────\n',
            ' 1    test   ID                 SECRET         TOKEN           123          test@test.com \n'
          ].join('')
        ]);

        done();
      });
    });
  });

});