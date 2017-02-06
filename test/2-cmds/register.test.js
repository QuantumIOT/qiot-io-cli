var _ = require('lodash');

var test = require('../test');

var register = require(process.cwd() + '/cmds/register');

describe('Command: register',function() {
  var config,commander,mockHTTPS;

  beforeEach(function () {
    config = test.standardBeforeEach();

    test.mockery.registerMock('commander',commander = {raw: true});
    test.mockery.registerMock('https',mockHTTPS = new test.MockHTTP());
  });

  afterEach(test.standardAfterEach);

  describe('when identity is invalid',function(){
    it('detects too many colons',function(){
      register('TEST:TEST:TEST',{},function(result){
        [result].should.eql(['invalid identity: TEST:TEST:TEST'])
      });
    })
  });

  describe('when not account_token exists',function(){
    it('should report an error',function(done){
      mockHTTPS.statusCode = 401;
      mockHTTPS.dataToRead = 'No Authorization header found';

      register('TEST',{},function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Unauthorized: No Authorization header found']);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/r : {"identity":[{"type":"SN","value":"TEST"}],"label":"TEST"}',
            'DEBUG - host output: No Authorization header found',
            'DEBUG - host status: Unauthorized'
          ]);

          done();
        });
      });
    });
  });

  describe('when an account_token exists',function(){
    beforeEach(function(){
      config.settings.account_token = 'ACCOUNT-TOKEN';
    });

    afterEach(function(){
      delete config.settings.account_token;
    });

    it('should handle an HTTP error code',function(done){
      mockHTTPS.statusCode = 403;

      register('TEST',{},function(result){
        test.safeAssertions(done,function(){
          [result].should.eql(['Forbidden']);

          mockHTTPS.dataWritten.should.eql([
            'request={"method":"POST","host":"api.qiot.io","port":443,"path":"/1/r","headers":{"Content-Type":"application/json","Authorization":"QIOT ACCOUNT-TOKEN","Content-Length":58}}',
            'write={"identity":[{"type":"SN","value":"TEST"}],"label":"TEST"}',
            'end'
          ]);
          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/r : {"identity":[{"type":"SN","value":"TEST"}],"label":"TEST"}',
            'DEBUG - host status: Forbidden'
          ]);

          done();
        });
      });
    });

    it('should successfully deliver a register message',function(done){
      mockHTTPS.dataToRead = '{"status":"success","thing":{"id":1,"label":"TEST","thing_type_id":null,"collection_id":2,"created_at":"2017-02-04T22:48:26.469Z","updated_at":"2017-02-04T22:48:26.469Z","deleted":false,"last_reported_at":null,"collection_token":"COLL-TOKEN","thing_token":"THING-TOKEN","account_token":"ACCOUNT-TOKEN","identities":[{"id":3,"type":"SN","value":"TEST","thing_id":1,"created_at":"2017-02-04T22:48:26.474Z","updated_at":"2017-02-04T22:48:26.474Z"},{"id":4,"type":"IMEI","value":"12345","created_at":"2017-02-04T22:48:26.474Z","updated_at":"2017-02-04T22:48:26.474Z"}]}}';

      register('SN:TEST,IMEI:12345',{},function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/r : {"identity":[{"type":"SN","value":"TEST"},{"type":"IMEI","value":"12345"}],"label":"SN-TEST"}',
            'DEBUG - host output: ' + mockHTTPS.dataToRead,
            'DEBUG - host status: OK',
            [
              ' id                        1                        \n',
              ' label                     TEST                     \n',
              ' thing_type_id                                      \n',
              ' collection_id             2                        \n',
              ' created_at                2017-02-04T22:48:26.469Z \n',
              ' updated_at                2017-02-04T22:48:26.469Z \n',
              ' deleted                   false                    \n',
              ' last_reported_at                                   \n',
              ' collection_token          COLL-TOKEN               \n',
              ' thing_token               THING-TOKEN              \n',
              ' account_token             ACCOUNT-TOKEN            \n',
              ' identities.0.id           3                        \n',
              ' identities.0.type         SN                       \n',
              ' identities.0.value        TEST                     \n',
              ' identities.0.thing_id     1                        \n',
              ' identities.0.created_at   2017-02-04T22:48:26.474Z \n',
              ' identities.0.updated_at   2017-02-04T22:48:26.474Z \n',
              ' identities.1.id           4                        \n',
              ' identities.1.type         IMEI                     \n',
              ' identities.1.value        12345                    \n',
              ' identities.1.created_at   2017-02-04T22:48:26.474Z \n',
              ' identities.1.updated_at   2017-02-04T22:48:26.474Z \n'
            ].join('')
          ]);

          done();
        });
      });
    });

    it('should allow the setting of a collection token and label',function(done){
      mockHTTPS.dataToRead = '{"status":"success","thing":{"id":1,"label":"LABEL","thing_type_id":null,"collection_id":2,"created_at":"2017-02-04T22:48:26.469Z","updated_at":"2017-02-04T22:48:26.469Z","deleted":false,"last_reported_at":null,"collection_token":"COLL-TOKEN","thing_token":"THING-TOKEN","account_token":"ACCOUNT-TOKEN","identities":[{"id":3,"type":"SN","value":"TEST","thing_id":1,"created_at":"2017-02-04T22:48:26.474Z","updated_at":"2017-02-04T22:48:26.474Z"},{"id":4,"type":"IMEI","value":"12345","created_at":"2017-02-04T22:48:26.474Z","updated_at":"2017-02-04T22:48:26.474Z"}]}}';

      commander.collection  = 'COLL-TOKEN';

      register('TEST,IMEI:12345',{label: 'LABEL'},function(result){
        test.safeAssertions(done,function(){
          [result].should.eql([null]);

          test.loggerCheckEntries([
            'DEBUG - host (api.qiot.io) POST /1/r : {"identity":[{"type":"SN","value":"TEST"},{"type":"IMEI","value":"12345"}],"label":"LABEL","collection_token":"COLL-TOKEN"}',
            'DEBUG - host output: ' + mockHTTPS.dataToRead,
            'DEBUG - host status: OK',
            [
              ' id                        1                        \n',
              ' label                     LABEL                    \n',
              ' thing_type_id                                      \n',
              ' collection_id             2                        \n',
              ' created_at                2017-02-04T22:48:26.469Z \n',
              ' updated_at                2017-02-04T22:48:26.469Z \n',
              ' deleted                   false                    \n',
              ' last_reported_at                                   \n',
              ' collection_token          COLL-TOKEN               \n',
              ' thing_token               THING-TOKEN              \n',
              ' account_token             ACCOUNT-TOKEN            \n',
              ' identities.0.id           3                        \n',
              ' identities.0.type         SN                       \n',
              ' identities.0.value        TEST                     \n',
              ' identities.0.thing_id     1                        \n',
              ' identities.0.created_at   2017-02-04T22:48:26.474Z \n',
              ' identities.0.updated_at   2017-02-04T22:48:26.474Z \n',
              ' identities.1.id           4                        \n',
              ' identities.1.type         IMEI                     \n',
              ' identities.1.value        12345                    \n',
              ' identities.1.created_at   2017-02-04T22:48:26.474Z \n',
              ' identities.1.updated_at   2017-02-04T22:48:26.474Z \n'
            ].join('')
          ]);

          done();
        });
      });
    });
  });

});