var test = require('../test');

var CMD = require(process.cwd() + '/lib/cmd');

describe('CMD',function() {
  var config = null;
  var commander = null;

  beforeEach(function(){
    config = test.standardBeforeEach(['prompt']);
    test.mockery.registerMock('commander',commander = {raw: true});
  });

  afterEach(test.standardAfterEach);

  describe('establishUser',function(){
    it('can handle an invalid token',function(){
      var cmd = new CMD();

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
      var cmd = new CMD();

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

      var cmd = new CMD();

      cmd.dumpObject(object);

      test.loggerCheckEntries([[
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1ma\u001b[22m   1 \n',
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1mb\u001b[22m   2 \n',
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1mc\u001b[22m   3 \n',
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1md\u001b[22m   4 \n',''
      ].join('')])
    });

    it('should create CSV output',function(){
      commander.raw = false;
      commander.csv = true;

      var cmd = new CMD();

      cmd.dumpObject(object);

      test.loggerCheckEntries([
        'a,1',
        'b,2',
        'c,3',
        'd,4'
      ])
    });

    it('should create TSV output',function(){
      commander.raw = false;
      commander.tsv = true;

      var cmd = new CMD();

      cmd.dumpObject(object);

      test.loggerCheckEntries([
        'a\t1',
        'b\t2',
        'c\t3',
        'd\t4'
      ])
    });

    it('should create JSON output',function(){
      commander.json = true;

      var cmd = new CMD();

      cmd.dumpObject(object);

      test.loggerCheckEntries([
        JSON.stringify(object,null,2)
      ])
    });

    it('should produce no output',function(){
      commander.silent = true;

      var cmd = new CMD();

      cmd.dumpObject(object);

      test.loggerCheckEntries([])
    });
  });

  describe('dumpTable',function(){
    var fields = ['a','d'];
    var objects = [{a: 1, b: 2, c: 3, d: 4}];

    it('should display only the selected fields',function(){
      var cmd = new CMD();

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([[
        ' a   d \n',
        '─── ───\n',
        ' 1   4 \n'
      ].join('')])
    });

    it('should display bold headers when raw option not set',function(){
      commander.raw = false;

      var cmd = new CMD();

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([[
        ' \u001b[1m\u001b[1m\u001b[1m\u001b[1ma\u001b[22m   \u001b[1m\u001b[1m\u001b[1m\u001b[1md\u001b[22m \n',
        '─── ───\n',
        ' 1   4 \n'
      ].join('')])
    });

    it('should override display fields with verbose option',function(){
      commander.verbose = true;

      var cmd = new CMD();

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([[
        ' a   b   c   d \n',
        '─── ─── ─── ───\n',
        ' 1   2   3   4 \n'
      ].join('')])
    });

    it('should create CSV output ',function(){
      commander.raw = false;
      commander.csv = true;

      var cmd = new CMD();

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([
        'a,d',
        '1,4'
      ])
    });

    it('should create TSV output',function(){
      commander.raw = false;
      commander.tsv = true;

      var cmd = new CMD();

      cmd.dumpTable(fields,objects);

      test.loggerCheckEntries([
        'a\td',
        '1\t4'
      ])
    });

    it('should order verbose field columns by levels before alphabetical order',function(){
      commander.verbose = true;

      var cmd = new CMD();

      cmd.dumpTable([],[{
        z : 1,
        y : {
          a : 4,
          w : {
            x: 7,
            b: 6,
          }
        },
        c: {
          e: 2,
          f: 3,
          d: {
            h: 5,
            g: {
              i: 8
            }
          }
        }
      }]);

      test.loggerCheckEntries([[
        ' z   c.e   c.f   y.a   c.d.h   y.w.b   y.w.x   c.d.g.i \n',
        '─── ───── ───── ───── ─────── ─────── ─────── ─────────\n',
        ' 1   2     3     4     5       6       7       8       \n'
      ].join('')])
    });

    it('should create JSON output',function(){
      commander.json = true;

      var cmd = new CMD();

      cmd.dumpTable([],objects);

      test.loggerCheckEntries([
        JSON.stringify(objects,null,2)
      ])
    });

    it('should produce no output',function(){
      commander.silent = true;

      var cmd = new CMD();

      cmd.dumpTable([],objects);

      test.loggerCheckEntries([])
    });
  });

  describe('checkSaveClear',function(){
    var key,current_key,oldSettings;

    beforeEach(function(){
      key = 'test';
      current_key = CMD.CURRENT_OPTION_PREFIX + key;

      oldSettings = {};
      oldSettings[current_key] = config.settings[current_key] = 'old';
      test.mockHelpers.filesToRead[config.config_file] = oldSettings;
    });

    afterEach(function(){
      delete config.settings[current_key];
    });

    describe('when save and clear are false',function(){
      it('should do nothing',function(){
        var cmd = new CMD();

        cmd.checkSaveClear(key);
      })
    });

    describe('when save is true',function(){
      beforeEach(function(){
        commander.save = true;
      });

      it('should do nothing if the option has not changed',function(){
        commander[key] = config.settings[current_key];

        var cmd = new CMD();

        cmd.checkSaveClear(key);

        test.mockHelpers.checkMockFiles([[config.config_file,'success']]);
      });

      it('should save the option if it has changed',function(){
        commander[key] = 'new';

        var cmd = new CMD();

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
          var cmd = new CMD();

          cmd.checkSaveClear(key);

          test.loggerCheckEntries(['DEBUG - update config: {}']);
          test.mockHelpers.checkMockFiles([[config.config_file,'success'],[config.config_file,'success']],[[config.config_file,{}]]);
        });
      });
    });
  });

  describe('outputCSV',function(){
    var testFunction = 'outputCSV';

    it('handles no rows',function(){
      var cmd = new CMD();

      cmd[testFunction]();
    });

    it('handles undefined values as empty strings',function(){
      var cmd = new CMD();

      cmd[testFunction]([[undefined,'a']]);

      test.loggerCheckEntries([',a']);
    });

    it('handles null values as empty strings',function(){
      var cmd = new CMD();

      cmd[testFunction]([[null,'a']]);

      test.loggerCheckEntries([',a']);
    });


    it('handles objects that were not flattened',function(){
      var cmd = new CMD();

      cmd[testFunction]([[{test: 1},'a']]);

      test.loggerCheckEntries(['"{""test"":1}",a']);
    });

    it('truncates trailing empty strings',function(){
      var cmd = new CMD();

      cmd[testFunction]([['a','',undefined,'']]);

      test.loggerCheckEntries(['a']);
    });

    it('converts Date object to ISO strings',function(){
      var date = new Date();
      var cmd = new CMD();

      cmd[testFunction]([[date]]);

      test.loggerCheckEntries([date.toISOString()]);
    });

    it('ensures that special conditions result in double-quoted values',function(){
      var cmd = new CMD();

      cmd[testFunction]([[' a','b ',',','"',' \ta",\n"b ']]);

      test.loggerCheckEntries([['" a"','"b "','","','""""','" \ta"",\n""b "'].join(',')]);
    })
  });

  describe('outputTSV',function(){
    var testFunction = 'outputTSV';

    it('handles no rows',function(){
      var cmd = new CMD();

      cmd[testFunction]();
    });

    it('handles undefined values as empty strings',function(){
      var cmd = new CMD();

      cmd[testFunction]([[undefined,'a']]);

      test.loggerCheckEntries(['\ta']);
    });

    it('handles null values as empty strings',function(){
      var cmd = new CMD();

      cmd[testFunction]([[null,'a']]);

      test.loggerCheckEntries(['\ta']);
    });

    it('handles objects that were not flattened',function(){
      var cmd = new CMD();

      cmd[testFunction]([[{test: 1},'a']]);

      test.loggerCheckEntries(['{"test":1}\ta']);
    });

    it('truncates trailing empty strings',function(){
      var cmd = new CMD();

      cmd[testFunction]([['a','',undefined,'']]);

      test.loggerCheckEntries(['a']);
    });

    it('converts Date object to ISO strings',function(){
      var date = new Date();
      var cmd = new CMD();

      cmd[testFunction]([[date]]);

      test.loggerCheckEntries([date.toISOString()]);
    });

    it('ensures that special conditions result in double-quoted values',function(){
      var cmd = new CMD();

      cmd[testFunction]([[' a','b ',',','"',' \ta,\n"b ']]);

      test.loggerCheckEntries([' a\tb \t,\t"\t  a, "b ']);
    })
  });

  describe('safeguard',function(){
    it('should catch an error',function(){
      var error = new Error();
      var cmd = new CMD();

      cmd.safeguard(
        function(e){ [e].should.eql([error]); },
        function(){ throw error; }
      )
    });
  });

});