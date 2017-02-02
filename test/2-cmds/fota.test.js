var _ = require('lodash');

var test = require('../test');

var fota = require(process.cwd() + '/cmds/fota');

describe('Command: fota',function() {
  var config = null;
  var mockHTTP = null;
  var commander = null;

  beforeEach(function () {
    config = test.standardBeforeEach(['prompt']);

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  var thing_token = 'THING';
  var url = 'http://skip-path/test.bin';
  var filesize = 1;
  var checksum = 2;
  var messageJSON = JSON.stringify({actions: [{version: 'test',filesize: filesize,checksum: checksum,url: url}]});

  describe('when an invalid url is given',function(){
    it('should record an error',function(done){
      fota(thing_token,'abc',filesize,checksum,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid url: abc']);

          test.loggerCheckEntries();

          done();
        });
      });
    });
  });

  describe('when an invalid filesize is given',function(){
    it('should record an error',function(done){
      fota(thing_token,url,'abc',checksum,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid filesize: abc']);

          test.loggerCheckEntries();

          done();
        });
      });
    });
  });

  describe('when an invalid checksum is given',function(){
    it('should record an error',function(done){
      fota(thing_token,url,filesize,'abc',function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid checksum: abc']);

          test.loggerCheckEntries();

          done();
        });
      });
    });
  });

  describe('when valid arguments are given',function(){
    beforeEach(function(){
      config.settings.account_token = 'ACCOUNT-TOKEN';
    });

    afterEach(function(){
      delete config.settings.account_token;
    });

    it('should handle an HTTP error code when unauthorized',function(done){
      mockHTTP.statusCode = 401;
      mockHTTP.dataToRead = 'No Authorization header found';

      fota(thing_token,url,filesize,checksum,function(result){
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

    it('should successfully deliver a fota message and echo it',function(done){
      mockHTTP.callbackOnEnd = function(){
        mockHTTP.statusCode = 204;
        mockHTTP.callbackOnEnd = function(){
          mockHTTP.statusCode = 200;
          mockHTTP.dataToRead = messageJSON;
        };
      };

      fota(thing_token,url,filesize,checksum,function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/m/THING : ' + messageJSON,
            'DEBUG - host status: No Content',
            'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
            'DEBUG - host output: ' + messageJSON,
            'DEBUG - host status: OK',
            [
              ' actions.0.version    test                      \n',
              ' actions.0.filesize   1                         \n',
              ' actions.0.checksum   2                         \n',
              ' actions.0.url        http://skip-path/test.bin \n'
            ].join('')
          ]);

          done();
        });
      });
    });

  });

});