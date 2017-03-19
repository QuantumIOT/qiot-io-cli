var _ = require('lodash');

var test = require('../test');

var cota = require(process.cwd() + '/cmds/cota');

describe('Command: cota',function() {
  var config, mockHTTPS, commander;

  var thing_token = 'THING';
  var messageJSON = JSON.stringify({cfg: {test: {num: 1,string: 'string'}}});

  beforeEach(function () {
    config = test.standardBeforeEach();

    config.settings.account_token = 'ACCOUNT-TOKEN';

    test.mockery.registerMock('https',mockHTTPS = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: 1});
  });

  afterEach(function(){
    delete config.settings.account_token;

    test.standardAfterEach()
  });

  it('should detect a bad key-value pair',function(done){
    cota(thing_token,['test.num'],function(result){
      test.safeAssertions(done,function(){
        [result].should.eql(['settings must be in the form <key>=<value>: test.num']);

        test.loggerCheckEntries([]);

        done();
      });
    });
  });

  it('should handle an HTTP error code when unauthorized',function(done){
    mockHTTPS.statusCode = 401;
    mockHTTPS.dataToRead = 'No Authorization header found';

    cota(thing_token,['test.num=1','test.string=string'],function(result){
      test.safeAssertions(done,function(){
        [result].should.eql(['Unauthorized: No Authorization header found']);

        test.loggerCheckEntries([
          'DEBUG - host (api.qiot.io) POST /1/m/THING : ' + messageJSON,
          'DEBUG - host output: No Authorization header found',
          'DEBUG - host status: Unauthorized'
        ]);

        done();
      });
    });
  });

  it('should successfully deliver a cota message and echo it',function(done){
    mockHTTPS.statusCode = [204,200];
    mockHTTPS.callbackOnEnd = function(){
      mockHTTPS.callbackOnEnd = function(){
        mockHTTPS.dataToRead = messageJSON;
      };
    };

    cota(thing_token,['test.num=1','test.string=string'],function(result){
      test.safeAssertions(done,function(){
        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (api.qiot.io) POST /1/m/THING : ' + messageJSON,
          'DEBUG - host status: No Content',
          'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
          'DEBUG - host output: ' + messageJSON,
          'DEBUG - host status: OK',
          [
            ' cfg.test.num      1      \n',
            ' cfg.test.string   string \n'
          ].join('')
        ]);

        done();
      });
    });
  });

});