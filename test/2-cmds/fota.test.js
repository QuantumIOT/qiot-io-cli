var _ = require('lodash');

var test = require('../test');

var fota = require(process.cwd() + '/cmds/fota');

describe('Command: fota',function() {
  var config, mockHTTPS, mockHTTP, commander;

  beforeEach(function () {
    config = test.standardBeforeEach(['prompt']);

    test.mockery.registerMock('http',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('https',mockHTTPS = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  var thing_token = 'THING';
  var url = 'http://domain/folder/test.bin';
  var messageJSON = JSON.stringify({actions: [{version: 'test',filesize: 123,checksum: 123,url: url}]});

  describe('when an invalid url is given',function(){
    it('should record an error',function(done){
      fota(thing_token,'abc',function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid url: abc']);

          test.loggerCheckEntries();

          done();
        });
      });
    });
  });

  describe('when an bin-related files are not found',function(){
    it('should record an error',function(done){
      mockHTTP.statusCode = 404;

      fota(thing_token,url,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Not Found']);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize'
          ]);

          done();
        });
      });
    });
  });

  describe('when an invalid filesize is given',function(){
    it('should record an error',function(done){
      mockHTTP.callbackOnEnd = function(){
        mockHTTP.dataToRead = 'abc';
        mockHTTP.callbackOnEnd = function(){
          mockHTTP.dataToRead = '123';
        };
      };

      fota(thing_token,url,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid filesize: abc']);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - filesize: abc',
            'DEBUG - checksum: /folder/test.checksum',
            'DEBUG - checksum: 123'
          ]);

          done();
        });
      });
    });
  });

  describe('when an invalid checksum is given',function(){
    it('should record an error',function(done){
      mockHTTP.callbackOnEnd = function(){
        mockHTTP.dataToRead = '123';
        mockHTTP.callbackOnEnd = function(){
          mockHTTP.dataToRead = 'abc';
        };
      };

      fota(thing_token,url,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid checksum: abc']);


          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - filesize: 123',
            'DEBUG - checksum: /folder/test.checksum',
            'DEBUG - checksum: abc'
          ]);

          done();
        });
      });
    });
  });

  describe('when valid arguments are given',function(){
    beforeEach(function(){
      mockHTTP.dataToRead = '123';

      config.settings.account_token = 'ACCOUNT-TOKEN';
    });

    afterEach(function(){
      delete config.settings.account_token;
    });

    it('should handle an HTTP error code when unauthorized',function(done){
      mockHTTPS.statusCode = 401;
      mockHTTPS.dataToRead = 'No Authorization header found';

      fota(thing_token,url,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Unauthorized: No Authorization header found']);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - filesize: 123',
            'DEBUG - checksum: /folder/test.checksum',
            'DEBUG - checksum: 123',
            'DEBUG - host (api.qiot.io) POST /1/m/THING : ' + messageJSON,
            'DEBUG - host output: No Authorization header found',
            'DEBUG - host status: Unauthorized'
          ]);

          done();
        });
      });
    });

    it('should successfully deliver a fota message and echo it',function(done){
      mockHTTPS.callbackOnEnd = function(){
        mockHTTPS.statusCode = 204;
        mockHTTPS.callbackOnEnd = function(){
          mockHTTPS.statusCode = 200;
          mockHTTPS.dataToRead = messageJSON;
        };
      };

      fota(thing_token,url,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - filesize: 123',
            'DEBUG - checksum: /folder/test.checksum',
            'DEBUG - checksum: 123',
            'DEBUG - host (api.qiot.io) POST /1/m/THING : ' + messageJSON,
            'DEBUG - host status: No Content',
            'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
            'DEBUG - host output: ' + messageJSON,
            'DEBUG - host status: OK',
            [
              ' actions.0.version    test                          \n',
              ' actions.0.filesize   123                           \n',
              ' actions.0.checksum   123                           \n',
              ' actions.0.url        http://domain/folder/test.bin \n'
            ].join('')
          ]);

          done();
        });
      });
    });

  });

});