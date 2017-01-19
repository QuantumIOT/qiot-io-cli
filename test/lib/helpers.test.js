var fs = require('fs');
var test = require('../test');

var helperPath = process.cwd() + '/lib/helpers';

describe('helpers',function(){
  var helpers = null;

  beforeEach(function () {
    test.mockery.enable();
    test.mockery.registerAllowables(['lodash','./config','./logger',helperPath]);
    test.mockery.warnOnReplace(false);
    test.loggerBeforeEach();

    helpers = require(helperPath);
    helpers.resetLogger();
  });

  afterEach(function () {
    test.loggerAfterEach();
    test.mockery.disable();
  });

  describe('readJSON',function(){
    it('should read a JSON file if it exists',function(){
      helpers.readJSON(process.cwd() + '/test/data/test.json',{result: 'default'},{result: 'error'}).should.eql({state: 'test'});
    });

    it('should return the default value if the file does not exist',function(){
      helpers.readJSON(process.cwd() + '/test/data/missing.json',{result: 'default'},{result: 'error'}).should.eql({result: 'default'});
    });

    it('should return the error value if the file is invalid',function(){
      helpers.readJSON(process.cwd() + '/test/data/invalid.json',{result: 'default'},{result: 'error'}).should.eql({result: 'error'});
      test.loggerCheckEntries(['ERROR - SyntaxError: Unexpected end of input']);
    });
  });

  describe('saveJSON',function(){
    it('should save a JSON object to a file',function(){
      fs.mkdir('tmp/',function(error) {
        var testFile = 'tmp/save-test.json';
        helpers.saveJSON(testFile,{success: true});
        fs.readFileSync(testFile).toString().should.eql('{"success":true}');
        fs.unlinkSync(testFile);
      });
    });

    it('should log an error if saving fails',function(){
      helpers.saveJSON(null,{success: true});
      test.loggerCheckEntries(['ERROR - save JSON error - TypeError: path must be a string']);
    })
  });

  describe('safeParseJSON',function(){
    it('should return valid parsed json',function(){
      helpers.safeParseJSON('{"test":1}').should.eql({test: 1});
    });

    it('should return null for invalid json',function(){
      (helpers.safeParseJSON('{') === null).should.be.ok;
      test.loggerCheckEntries(['ERROR - json error: SyntaxError: Unexpected end of input']);
    });
  });

  describe('fileExists',function(){
    it('should return stat object for file that exists',function(){
      (!!helpers.fileExists('test/test.js')).should.be.ok;
    });

    it('should return null for invalid json',function(){
      (!!helpers.fileExists('unknown.txt')).should.not.be.ok;
    });
  });
});