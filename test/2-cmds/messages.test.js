var _ = require('lodash');

var test = require('../test');

var messages = require(process.cwd() + '/cmds/messages');

describe('Command: messages',function() {
  var config = null;
  var mockHTTP = null;
  var commander = null;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  it('should handle an HTTP error code',function(done){
    mockHTTP.statusCode = 403;

    messages(null,{},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql(['Forbidden']);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /messages : null',
          'DEBUG - host status: Forbidden'
        ]);

        done();
      });
    });
  });

  it('should print nothing if no messages are found',function(done){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',messages: [],binaryMessages: []});

    messages(null,{},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /messages : null',
          'DEBUG - host output: {"status":"success","messages":[],"binaryMessages":[]}',
          'DEBUG - host status: OK'
        ]);

        done();
      });
    });
  });

  it('should accept optional options',function(done){
    mockHTTP.dataToRead = JSON.stringify({status: 'success',messages: [],binaryMessages: []});

    commander.limit = 10;

    messages('TOKEN',{from: 'FROM',to: 'TO'},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /messages?thing_token=TOKEN&limit=10&time_from=FROM&time_to=TO : null',
          'DEBUG - host output: {"status":"success","messages":[],"binaryMessages":[]}',
          'DEBUG - host status: OK'
        ]);

        done();
      });
    });
  });

  it('should print messages to console if found',function(done){
    var testMessage = {accountToken: 'ACCOUNT-TOKEN',thingToken: 'THING-TOKEN',id: 'ID',message: {time: 'TIME'}};
    mockHTTP.dataToRead = JSON.stringify({status: 'success',messages: [testMessage],binaryMessages: [testMessage]});

    messages(null,{},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /messages : null',
          'DEBUG - host output: {"status":"success","messages":[{"accountToken":"ACCOUNT-TOKEN","thingToken":"THING-TOKEN","id":"ID","message":{"time":"TIME"}}],"binaryMessages":[{"accountToken":"ACCOUNT-TOKEN","thingToken":"THING-TOKEN","id":"ID","message":{"time":"TIME"}}]}',
          'DEBUG - host status: OK',
          [
            ' accountToken    thingToken    id   message.time \n',
            '─────────────── ───────────── ──── ──────────────\n',
            ' ACCOUNT-TOKEN   THING-TOKEN   ID   TIME         \n'
          ].join(''),
          [
            ' accountToken    thingToken    id   message.time \n',
            '─────────────── ───────────── ──── ──────────────\n',
            ' ACCOUNT-TOKEN   THING-TOKEN   ID   TIME         \n'
          ].join('')
        ]);

        done();
      });
    });
  });

  it('should print only the fields in any messages matching a filter',function(done){
    var testMessage = {accountToken: 'ACCOUNT-TOKEN',thingToken: 'THING-TOKEN',id: 'ID',message: {time: 'TIME',test: 1}};
    mockHTTP.dataToRead = JSON.stringify({status: 'success',messages: [testMessage],binaryMessages: [testMessage]});

    messages(null,{filter: 'message.time,message.test'},function(result){
      test.safeAssertions(done,function(){

        [result].should.eql([null]);

        test.loggerCheckEntries([
          'DEBUG - host (qiot.io) GET /messages : null',
          'DEBUG - host output: {"status":"success","messages":[{"accountToken":"ACCOUNT-TOKEN","thingToken":"THING-TOKEN","id":"ID","message":{"time":"TIME","test":1}}],"binaryMessages":[{"accountToken":"ACCOUNT-TOKEN","thingToken":"THING-TOKEN","id":"ID","message":{"time":"TIME","test":1}}]}',
          'DEBUG - host status: OK',
          [
            ' message.time   message.test \n',
            '────────────── ──────────────\n',
            ' TIME           1            \n'
          ].join(''),
          [
            ' message.time   message.test \n',
            '────────────── ──────────────\n',
            ' TIME           1            \n'
          ].join('')
        ]);

        done();
      });
    });
  });

  it('should invoke a socket if the option is set and thing_token given',function(done){
    var socket = function(service,event,data) {
      [service,event,data].should.eql(['messages','thingToListen','THING']);
      done();
    };

    test.mockery.registerMock('./socket',socket);

    messages('THING',{socket: true});
  });

});