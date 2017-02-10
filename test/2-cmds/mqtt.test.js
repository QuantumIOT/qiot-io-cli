var _ = require('lodash');
var prompt = require('prompt');

var test = require('../test');

var mqtt = require(process.cwd() + '/cmds/mqtt');

describe('Command: mqtt',function() {
  var config,commander,mqttStub,clientStub;

  beforeEach(function () {
    config = test.standardBeforeEach();
    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('mqtt',mqttStub = {});

    mqttStub.connect = function(options){
      clientStub = {options: options,eventsEmitted: [],actionsTaken: [],eventCallbacks: {},publishResponse: []};

      clientStub.eventCallbacks = {};

      clientStub.on = function(event,callback) {
        clientStub.eventCallbacks[event] = callback;
        return clientStub;
      };

      clientStub.emit = function(event,data){
        clientStub.eventsEmitted.push([event,data]);
      };

      clientStub.subscribe = function(topic,options,callback){
        clientStub.actionsTaken.push({subscribe: [topic,options]});
        clientStub.eventCallbacks['subscribe:' + topic] = callback;
      };

      clientStub.publish = function(topic,message,options,callback){
        clientStub.actionsTaken.push({publish: [topic,message,options]});
        _.defer(callback,clientStub.publishResponse.shift() || null);
      };

      clientStub.end = function(force,callback){
        clientStub.actionsTaken.push({end: force});
        _.defer(callback);
      };

      return clientStub;
    };
  });

  afterEach(test.standardAfterEach);

  describe('when no account_token is given',function(){
    it('should detect an error',function(){
      mqtt('THING',function(result){
        [result].should.eql(['no account token found']);
      });
    })
  });

  describe('when an invalid account_token is given',function(){

    beforeEach(function(){
      promptStub = test.sinon.stub(prompt,'get');
      config.settings.account_token = new Buffer('ACCOUNT-ID').toString('base64');
    });

    afterEach(function(){
      promptStub.restore();
      delete config.settings.account_token;
    });

    it('should detect an error',function(){
      mqtt('THING',function(result){
        [result].should.eql(['invalid account token']);
      });
    })
  });

  describe('when an account_token is given',function(){
    var promptStub;

    beforeEach(function(){
      promptStub = test.sinon.stub(prompt,'get');
      config.settings.account_token = new Buffer('ACCOUNT-ID:ACCOUNT-SECRET').toString('base64');
    });

    afterEach(function(){
      promptStub.restore();
      delete config.settings.account_token;
    });

    it('should create an mqtt client and put it through its paces',function(done){

      commander.raw = false;

      promptStub.onFirstCall().callsArgWith(1,null,{publish: ''});
      promptStub.onSecondCall().callsArgWith(1,null,{publish: '{"action":"test1"}'});
      promptStub.onThirdCall().callsArgWith(1,null,{publish: '{"action":"test2"}'});
      promptStub.onCall(3).callsArgWith(1,'cancel');

      mqtt('THING',function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([undefined]);
          test.loggerCheckEntries([
            'DEBUG - input: ',
            'DEBUG - input: {"action":"test1"}',
            'DEBUG - publish successful',
            'DEBUG - input: {"action":"test2"}',
            'ERROR - test-error'
          ]);
          done();
        });
      });

      clientStub.publishResponse = [null,'test-error'];

      (!!clientStub).should.be.ok;
      clientStub.options.should.eql({clean: true,clientId: 'THING',host: 'api.qiot.io',keepalive: 60,password: 'ACCOUNT-SECRET',port: 1883,username: 'ACCOUNT-ID'});
      _.keys(clientStub.eventCallbacks).should.eql(['error','reconnect','close','offline','connect','subscribe:1/m/THING','message']);

      clientStub.eventCallbacks.error('test-error');
      clientStub.eventCallbacks.reconnect();
      clientStub.eventCallbacks.offline();
      clientStub.eventCallbacks.close();
      clientStub.eventCallbacks.connect('ack');
      clientStub.eventCallbacks['subscribe:1/m/THING'](null,true);
      clientStub.eventCallbacks.message('MESSAGE');

      test.loggerCheckEntries([
        'ERROR - error: test-error',
        'DEBUG - reconnect',
        'DEBUG - offline',
        'DEBUG - close',
        'DEBUG - connected: "ack"',
        'subscribe: null:true',
        undefined,
        'mailbox message[MESSAGE]: undefined',
        undefined
      ]);
    });

    it('should allow "raw" mode to pass unvalidated JSON messages',function(done){

      promptStub.onFirstCall().callsArgWith(1,null,{publish: '{"action"'});
      promptStub.onSecondCall().callsArgWith(1,'cancel');

      mqtt('THING',function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([undefined]);
          test.loggerCheckEntries([
            'DEBUG - input: {"action"',
            'DEBUG - publish successful'
          ]);
          done();
        });
      });

      (!!clientStub).should.be.ok;
      clientStub.options.should.eql({clean: true,clientId: 'THING',host: 'api.qiot.io',keepalive: 60,password: 'ACCOUNT-SECRET',port: 1883,username: 'ACCOUNT-ID'});
      _.keys(clientStub.eventCallbacks).should.eql(['error','reconnect','close','offline','connect','subscribe:1/m/THING','message']);

      clientStub.eventCallbacks.connect('ack');

      test.loggerCheckEntries([
        'DEBUG - connected: "ack"'
      ]);
    });
  });

});