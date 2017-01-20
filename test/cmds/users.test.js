var _ = require('lodash');

var test = require('../test');

var users = require(process.cwd() + '/cmds/users');

describe('Command: users',function() {
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

    users({},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql(['Forbidden']);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /users : null',
          'DEBUG - host status: Forbidden'
        ]);

        done();
      });
    });
  });

  it('should print users to console on success',function(done){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',users: [{id: 1,name: 'test',email: 'test@test.com',account_id: 2,role:{name: 'admin'}}]});

    users({},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /users : null',
          'DEBUG - host output: {"status":"success","users":[{"id":1,"name":"test","email":"test@test.com","account_id":2,"role":{"name":"admin"}}]}',
          'DEBUG - host status: OK',
          [
            ' id   name   email           account_id   role.name   oauth_provider \n',
            '──── ────── ─────────────── ──────────── ─────────── ────────────────\n',
            ' 1    test   test@test.com   2            admin                      \n'
          ].join('')
        ]);

        done();
      });
    });
  });

});