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

  it('should receive a successful response for an unknown API call',function(done){
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

  it('should receive a successful response for a known API call',function(done){
    mockHTTP.dataToRead = JSON.stringify({users: [{id: 'ID',name: 'NAME',email: 'EMAIL',account_id: 'ACCOUNT',role: {name: 'ROLE'},oauth_provider: 'github'}]});

    rest('GET','/users',null,function(result){
      test.safeAssertions(done,function(){
        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /users : null',
          'DEBUG - host output: {"users":[{"id":"ID","name":"NAME","email":"EMAIL","account_id":"ACCOUNT","role":{"name":"ROLE"},"oauth_provider":"github"}]}',
          'DEBUG - host status: OK',
          [
            ' id   name   email   account_id   role.name   oauth_provider \n',
            '──── ────── ─────── ──────────── ─────────── ────────────────\n',
            ' ID   NAME   EMAIL   ACCOUNT      ROLE        github         \n'
          ].join('')
        ]);

        done();
      });
    });
  });

  describe('findDefn',function(){
    it('should match a simple API pattern',function(){
      var defn = rest.findDefn('GET','/users',null);

      (!!defn).should.eql(true);
      _.pick(defn,['method','path','body']).should.eql({method: 'GET',path: '/users',body: false});
    });

    it('should NOT match a simple API pattern with a different method',function(){
      var defn = rest.findDefn('POST','/users',null);

      (!defn).should.eql(true);
    });

    it('should NOT match a simple API pattern with a different body',function(){
      var defn = rest.findDefn('GET','/users','body');

      (!defn).should.eql(true);
    });

    it('should match a complex API pattern',function(){
      var defn = rest.findDefn('PUT','/users/users/1/impersonate',null);

      (!!defn).should.eql(true);
      _.pick(defn,['method','path','body']).should.eql({method: 'PUT',path: '/users/users/{userid}/impersonate',body: false});
    });
  });

});