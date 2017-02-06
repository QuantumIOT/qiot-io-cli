var _ = require('lodash');

var test = require('../test');

var things = require(process.cwd() + '/cmds/things');

var TEST_THING = {id: 1, label: 'LABEL', thing_token: 'THING', collection_token: 'COLLECTION', account_token: 'ACCOUNT', collection_id: 2, last_reported_at: 'DATE', identities: [{type: 'SN', value: 'TEST'}]};

describe('Command: things',function() {
  var config = null;
  var commander = null;
  var mockHTTP = null;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('https',mockHTTP = new test.MockHTTP());
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  function standardSetupMockHTTP(data){
    mockHTTP.dataToRead = JSON.stringify(data);
  }

  function standardAssertMockHTTP(path){
    test.loggerCheckEntries([
      'DEBUG - host (qiot.io) GET '+ path + ' : null',
      'DEBUG - host output: ' + mockHTTP.dataToRead,
      'DEBUG - host status: OK',
      [
        ' id   label   thing_token   collection_token   account_token   collection_id   last_reported_at   identities.0.type   identities.0.value \n',
        '──── ─────── ───────────── ────────────────── ─────────────── ─────────────── ────────────────── ─────────────────── ────────────────────\n',
        ' 1    LABEL   THING         COLLECTION         ACCOUNT         2               DATE               SN                  TEST               \n'
      ].join('')
    ]);

    _.keys(mockHTTP.eventCallbacks).should.eql(['request','error','data','end']);
    mockHTTP.dataWritten.should.eql([
      'request={"method":"GET","host":"qiot.io","port":443,"path":"' + path + '","headers":{"Content-Type":"application/json"}}',
      'end'
    ]);
  }

  describe('when no account or collection options exist',function(){
    it('should report an error',function(){
      things(function(result){
        [result].should.eql(['no collection or account found'])
      });
    });
  });

  describe('when a collection option is provided',function(){
    beforeEach(function(){
      commander.collection = 1;
    });

    collectionTests();
  });

  describe('when a current_collection exists',function(){
    beforeEach(function(){
      config.settings.current_collection = 1;
    });

    afterEach(function(){
      delete config.settings.current_collection;
    });

    collectionTests();
  });

  function collectionTests(){
    it('should handle invalid access',function(done){
      mockHTTP.statusCode = 403;

      things(function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /users/collections/1/collection+things : null',
            'DEBUG - host status: Forbidden'
          ]);
          done();
        })
      });
    });

    it('should handle successful response',function(done){
      standardSetupMockHTTP({status: 'success',collection: {things: [TEST_THING]}});

      things(function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);
          standardAssertMockHTTP('/users/collections/1/collection+things');
          done();
        })
      });
    });
  }

  describe('when a account option is provided',function(){
    beforeEach(function(){
      commander.account = 1;
    });

    accountTests();
  });

  describe('when a current_account exists',function(){
    beforeEach(function(){
      config.settings.current_account = 1;
    });

    afterEach(function(){
      delete config.settings.current_account;
    });

    accountTests();
  });
  
  function accountTests(){
    it('should handle invalid access',function(done){
      mockHTTP.statusCode = 403;

      things(function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);
          test.loggerCheckEntries([
            'DEBUG - host (qiot.io) GET /users/accounts/1/things : null',
            'DEBUG - host status: Forbidden'
          ]);
          done();
        })
      });
    });

    it('should handle successful response',function(done){
      standardSetupMockHTTP({status: 'success',things: [TEST_THING]});

      things(function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);
          standardAssertMockHTTP('/users/accounts/1/things');
          done();
        })
      });
    });

    it('should invoke a socket if the option is set',function(done){
      var socket = function(service,event,data) {
        [service,event,data].should.eql(['users','listenAccountThingsChannel',1]);
        done();
      };

      test.mockery.registerMock('./socket',socket);

      things({socket: true});
    });
  }
});