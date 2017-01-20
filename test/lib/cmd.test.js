var test = require('../test');

var CMD = require(process.cwd() + '/lib/cmd');

describe('cmd',function() {
  var config = null;
  var commander = null;
  var cmd = null;

  beforeEach(function(){
    config = test.standardBeforeEach(['prompt']);
    test.mockery.registerMock('commander',commander = {raw: true});

    cmd = new CMD();
  });

  afterEach(test.standardAfterEach);

  describe('establishUser',function(){
    it('can handle an invalid token',function(){
      cmd.establishUser('TOKEN');

      delete config.settings.user_token;

      test.loggerCheckEntries([
        'ERROR - invalid token: TOKEN',
        'DEBUG - update config: {"user_token":"TOKEN"}',
        [
          ' current_user                \n',
          ' current_account             \n'
        ].join('')
      ]);
      test.mockHelpers.checkMockFiles([[config.config_file,'default'],[config.config_file,'success']],[[config.config_file,{user_token: 'TOKEN'}]])
    });
  });

  describe('dumpObject',function(){
    var object = {a: 1, b: 2, c: 3, d: 4};

    it('should display all the key-value pairs',function(){
      cmd.dumpObject(object);

      test.loggerCheckEntries([[
        ' a   1 \n',
        ' b   2 \n',
        ' c   3 \n',
        ' d   4 \n'
      ].join('')])
    });

    it('should display the key column in bold if raw option not set',function(){
      commander.raw = false;

      cmd.dumpObject(object);

      test.loggerCheckEntries([[
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1ma\u001b[22m   1 \n',
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1mb\u001b[22m   2 \n',
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1mc\u001b[22m   3 \n',
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1md\u001b[22m   4 \n',''
      ].join('')])
    });
  });

  describe('dumpTable',function(){
    var fields = ['a','d'];
    var objects = [{a: 1, b: 2, c: 3, d: 4}];

    it('should display only the selected fields',function(){
      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([[
        ' a   d \n',
        '─── ───\n',
        ' 1   4 \n'
      ].join('')])
    });

    it('should display bold headers when raw option not set',function(){
      commander.raw = false;

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([[
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1ma\u001b[22m   \u001b[1m\u001b[1m\u001b[1m\u001b[1md\u001b[22m \n',
        '─── ───\n',
        ' 1   4 \n'
      ].join('')])
    });

    it('should override display fields with verbose option',function(){
      commander.verbose = true;

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([[
        ' a   b   c   d \n',
        '─── ─── ─── ───\n',
        ' 1   2   3   4 \n'
      ].join('')])
    })
  });

  describe('checkSaveClear',function(){
    var key, current_key,oldSettings;

    beforeEach(function(){
      key = 'test';
      current_key = cmd.CURRENT_OPTION_PREFIX + key;

      oldSettings = {};
      oldSettings[current_key] = config.settings[current_key] = 'old';
      test.mockHelpers.filesToRead[config.config_file] = oldSettings;
    });

    afterEach(function(){
      delete config.settings[current_key];
    });

    describe('when save and clear are false',function(){
      it('should do nothing',function(){
        cmd.checkSaveClear(key);
      })
    });

    describe('when save is true',function(){
      beforeEach(function(){
        commander.save = true;
      });

      it('should do nothing if the option has not changed',function(){
        commander[key] = config.settings[current_key];

        cmd.checkSaveClear(key);

        test.mockHelpers.checkMockFiles([[config.config_file,'success']]);
      });

      it('should save the option if it has changed',function(){
        commander[key] = 'new';

        cmd.checkSaveClear(key);

        var result = {};
        result[current_key] = 'new';
        test.loggerCheckEntries(['DEBUG - update config: {"current_test":"new"}']);
        test.mockHelpers.checkMockFiles([[config.config_file,'success'],[config.config_file,'success']],[[config.config_file,result]]);
      });

      describe('when clear is true, overriding save',function(){
        beforeEach(function(){
          commander.clear = true;
        });

        it('should clear the option',function(){
          cmd.checkSaveClear(key);

          test.loggerCheckEntries(['DEBUG - update config: {}']);
          test.mockHelpers.checkMockFiles([[config.config_file,'success'],[config.config_file,'success']],[[config.config_file,{}]]);
        });
      });
    });
  });

  describe('safeguard',function(){
    it('should catch an error',function(){
      var error = new Error();
      cmd.safeguard(
        function(e){ [e].should.eql([error]); },
        function(){ throw error; }
      )
    });
  });

});