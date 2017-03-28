var _ = require('lodash');

var test = require('../test');

var fota = require(process.cwd() + '/cmds/fota');

describe('Command: fota',function() {
  var config, mockHTTPS, mockHTTP, commander;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('http',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('https',mockHTTPS = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  var thing_token = 'THING';
  var url = 'http://domain/folder/test.bin';
  var messageJSON = JSON.stringify({actions: [{type: 'fota',target: 'mcu',version: 'abc',url: url,filesize: 123,checksum: 123}]});

  describe('when an invalid url is given',function(){
    it('should record an error',function(done){
      fota(thing_token,['mcu,abc,abc'],function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid url: abc']);

          test.loggerCheckEntries();

          done();
        });
      });
    });
  });

  describe('when no url is given',function(){
    it('should record an error when no config prefix is set',function(done){
      fota(thing_token,['mcu,abc'],function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['missing fota url prefix']);

          test.loggerCheckEntries();

          done();
        });
      });
    });

    it('should construct a url using the given version and config prefix/suffix',function(done){
      mockHTTP.statusCode = 404; // NOTE - use "not found" to stop after checking for correct URL
      config.settings.fota_url_prefix = 'http://domain/folder/';

      fota(thing_token,['mcu,test'],function(result){
        test.safeAssertions(done,function(){
          delete config.settings.fota_url_prefix;

          [result].should.eql(['Not Found']);

          test.loggerCheckEntries([
            'DEBUG - constructed url: http://domain/folder/mcu/test.bin',
            'DEBUG - filesize: /folder/mcu/test.filesize',
            'DEBUG - checksum: /folder/mcu/test.checksum'
          ]);

          done();
        });
      });
    });
  });

  describe('when an bin-related files are not found',function(){
    it('should record an error',function(done){
      mockHTTP.statusCode = 404;

      fota(thing_token,['mcu,abc,' + url],function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Not Found']);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - checksum: /folder/test.checksum'
          ]);

          done();
        });
      });
    });
  });

  describe('when an invalid data is given',function(){
    it('should record an error',function(done){
      mockHTTP.dataToRead = 'abc';

      fota(thing_token,['mcu,abc,' + url],function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['invalid filesize: abc']);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - checksum: /folder/test.checksum'
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

      fota(thing_token,['mcu,abc,' + url],function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Unauthorized: No Authorization header found']);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - checksum: /folder/test.checksum',
            'DEBUG - filesize: 123',
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
      mockHTTPS.statusCode = [204,200];
      mockHTTPS.callbackOnEnd = function(){
        mockHTTPS.callbackOnEnd = function(){
          mockHTTPS.dataToRead = messageJSON;
        };
      };

      fota(thing_token,['mcu,abc,' + url],function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - filesize: /folder/test.filesize',
            'DEBUG - checksum: /folder/test.checksum',
            'DEBUG - filesize: 123',
            'DEBUG - checksum: 123',
            'DEBUG - host (api.qiot.io) POST /1/m/THING : ' + messageJSON,
            'DEBUG - host status: No Content',
            'DEBUG - host (api.qiot.io) GET /1/m/THING : null',
            'DEBUG - host output: ' + messageJSON,
            'DEBUG - host status: OK',
            [
              ' actions.0.type       fota                          \n',
              ' actions.0.target     mcu                           \n',
              ' actions.0.version    abc                           \n',
              ' actions.0.url        http://domain/folder/test.bin \n',
              ' actions.0.filesize   123                           \n',
              ' actions.0.checksum   123                           \n'
            ].join('')
          ]);

          done();
        });
      });
    });

  });

});