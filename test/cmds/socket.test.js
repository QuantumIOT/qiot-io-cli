var _ = require('lodash');

var test = require('../test');

var socket = require(process.cwd() + '/cmds/socket');

describe('Command: socket',function() {
  var config,commander,socketStub,wildcardStub,mockSocket;

  beforeEach(function () {
    config = test.standardBeforeEach(['prompt']);
    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('socket.io-client',socketStub = test.sinon.stub());
    test.mockery.registerMock('socketio-wildcard',wildcardStub = test.sinon.stub());

    wildcardStub.returns(function(){});

    socketStub.returns(mockSocket = {eventCallbacks: {},eventsEmitted: []});

    mockSocket.eventCallbacks = {};

    mockSocket.on = function(event,callback) {
      mockSocket.eventCallbacks[event] = callback;
      return mockSocket;
    };

    mockSocket.emit = function(event,data){
      mockSocket.eventsEmitted.push([event,data || null]);
    };
  });

  afterEach(test.standardAfterEach);

  it('should connect, authenticate, and receive events',function(){
    socket('tservice','tevent','tdata');

    socketStub.getCalls().length.should.eql(1);
    socketStub.getCall(0).args.should.eql(['https://qiot.io',{path: '/tservice/socket.io',timeout: 500}]);

    mockSocket.eventsEmitted.should.eql([]);
    test.loggerCheckEntries([
      'DEBUG - https://qiot.io: /tservice/socket.io',
      'DEBUG - on: connect_error',
      'DEBUG - on: error',
      'DEBUG - on: disconnect',
      'DEBUG - on: reconnect',
      'DEBUG - on: reconnect_attempt',
      'DEBUG - on: reconnecting',
      'DEBUG - on: reconnect_failed',
      'DEBUG - on: reconnect_error',
      'DEBUG - on: event',
      'waiting...'
    ]);

    mockSocket.eventCallbacks.connect();

    mockSocket.eventsEmitted.should.eql([['authentication',{auth_token: config.settings.user_token}]]);
    mockSocket.eventsEmitted = [];
    test.loggerCheckEntries([
      'connect',
      'DEBUG - emit(authentication,...)'
    ]);

    mockSocket.eventCallbacks.authenticated();

    mockSocket.eventsEmitted.should.eql([['tevent','tdata']]);
    mockSocket.eventsEmitted = [];
    test.loggerCheckEntries(['DEBUG - emit(tevent,tdata)']);

    mockSocket.eventCallbacks['*']({type: 2,nsp: '/',data:['key','value']});
    test.loggerCheckEntries([[
      ' event   key   \n',
      ' data    value \n'
    ].join('')]);

    mockSocket.eventCallbacks['*']({type: 2,nsp: '/',data:[]});
    test.loggerCheckEntries(['ERROR - unexpected event: {"type":2,"nsp":"/","data":[]}']);

    mockSocket.eventCallbacks.error('test-error');
    test.loggerCheckEntries(['ERROR - error: test-error']);
  })

});