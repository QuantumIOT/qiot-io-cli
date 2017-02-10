var _ = require('lodash');

var test = require('../test');

var socket = require(process.cwd() + '/cmds/socket');

describe('Command: socket',function() {
  var config,commander,socketStub,wildcardStub,mockSocket;

  beforeEach(function () {
    config = test.standardBeforeEach();
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
  
  it('should allow localhost access',function(){
    config.settings.host_service = 'http';
    config.settings.host_dns     = 'localhost';
    config.settings.host_port    = 3000;
    config.settings.users_prefix = false;

    socket('tservice','tevent','tdata');

    socketStub.getCalls().length.should.eql(1);
    socketStub.getCall(0).args.should.eql(['http://localhost:3000',{path: '/socket.io',timeout: 500}]);

    mockSocket.eventsEmitted.should.eql([]);
    test.loggerCheckEntries([
      'DEBUG - http://localhost:3000: /socket.io',
      'waiting...'
    ]);

    config.settings.host_service = config.defaults.host_service;
    config.settings.host_dns     = config.defaults.host_dns;
    config.settings.host_port    = config.defaults.host_port;
    config.settings.users_prefix = config.defaults.users_prefix;
  });

  it('should connect, authenticate, and receive events',function(){
    socket('tservice','tevent','tdata');

    socketStub.getCalls().length.should.eql(1);
    socketStub.getCall(0).args.should.eql(['https://qiot.io:443',{path: '/tservice/socket.io',timeout: 500}]);

    mockSocket.eventsEmitted.should.eql([]);
    test.loggerCheckEntries([
      'DEBUG - https://qiot.io:443: /tservice/socket.io',
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
      ' event      key   \n',
      ' response   value \n'
    ].join('')]);

    mockSocket.eventCallbacks['*']({type: 2,nsp: '/',data:[]});
    test.loggerCheckEntries(['ERROR - unexpected event: {"type":2,"nsp":"/","data":[]}']);

    mockSocket.eventCallbacks.error('test-error');
    test.loggerCheckEntries(['ERROR - error: test-error']);
  })

});