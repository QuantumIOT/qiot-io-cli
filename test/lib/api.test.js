var _ = require('lodash');

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

    it('will dump an object if no table fields defined',function(done){
      var enclosure = function(){
        var defn = _.clone(API.findDefn({command: 'users'}));
        defn.table_fields = null;

        API.executeDefn(arguments,defn);
      };

      mockHTTP.dataToRead = JSON.stringify({users: [{id: 'ID',name: 'NAME',email: 'EMAIL',account_id: 'ACCOUNT',role: {name: 'ROLE'},oauth_provider: 'github'}]});

      enclosure(function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /users : null',
            'DEBUG - host output: {"users":[{"id":"ID","name":"NAME","email":"EMAIL","account_id":"ACCOUNT","role":{"name":"ROLE"},"oauth_provider":"github"}]}',
            'DEBUG - host status: OK',
            [
              ' 0.id               ID      \n',
              ' 0.name             NAME    \n',
              ' 0.email            EMAIL   \n',
              ' 0.account_id       ACCOUNT \n',
              ' 0.role.name        ROLE    \n',
              ' 0.oauth_provider   github  \n'
            ].join('')
          ]);
          done();
        });
      });
    });
  });

});