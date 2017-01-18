var fs = require('fs');
var commander = require('commander');

var helpers = require('./lib/helpers');

commander
  .version(helpers.readJSON('package.json',{},{}).version)
  .option('-p --profile <name>','user profile')
  .option('-a --account <id-or-token>','target account')
  .option('-c --collection <id-or-token>','target collection')
  .option('-t --thing <id-or-token>','target thing')
  .option('-u --user <id-or-email>','target user')
  .option('-P --password <string>','signin user password');

commander
  .command('init')
  .action(require('./cmds/init'));

commander
  .command('signin')
  .alias('si')
  .action(require('./cmds/signin'));

commander.parse(process.argv);
