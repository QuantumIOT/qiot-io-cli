var fs = require('fs');
var commander = require('commander');

var helpers = require('./lib/helpers');

commander
  .version(helpers.readJSON('package.json',{},{}).version)
  .option('-p --profile <name>','user profile')
  .option('-a --account <id-or-token>','target account (save-able)')
  .option('-c --collection <id-or-token>','target collection (save-able)')
  .option('-t --thing <id-or-token>','target thing (save-able)')
  .option('-u --user <id-or-email>','target user')
  .option('-P --password <string>','signin user password')
  .option('-s --save','remember the applicable options as "current"')
  .option('--clear','forget the applicable options as "current"')
  .option('-v --verbose','display maximal output');

commander
  .command('init')
  .action(require('./cmds/init'));

commander
  .command('signin')
  .alias('si')
  .action(require('./cmds/signin'));

commander
  .command('impersonate')
  .alias('i')
  .action(require('./cmds/impersonate'));

commander
  .command('whoami')
  .alias('?')
  .action(require('./cmds/whoami'));

commander
  .command('accounts')
  .alias('a')
  .action(require('./cmds/accounts'));

commander
  .command('collections')
  .alias('c')
  .action(require('./cmds/collections'));

commander
  .command('things')
  .alias('t')
  .action(require('./cmds/things'));

commander.parse(process.argv);
