var fs = require('fs');
var commander = require('commander');
var events = require('events');

events.defaultMaxListeners = 12; // NOTE - bump up due to many command definitions

var helpers = require('./lib/helpers');

commander
  .version(helpers.readJSON('package.json',{},{}).version)
  .option('-p --profile <name>','user profile')
  .option('-a --account <id-or-token>','target account (save-able)')
  .option('-c --collection <id-or-token>','target collection (save-able)')
  .option('-t --thing <id-or-token>','target thing (save-able)')
  .option('-n --limit <number>','limit used for some queries')
  .option('-s --save','remember the applicable options as "current"')
  .option('--clear','forget the applicable options as "current"')
  .option('--raw','do not output any ansi special characters')
  .option('-v --verbose','display maximal output');

commander
  .command('init','initialize general configuration settings')
  .action(require('./cmds/init'));

commander
  .command('signin [email] [password]','signin a local user with email and password')
  .alias('si')
  .action(require('./cmds/signin'));

commander
  .command('impersonate [userid]','impersonate a user')
  .alias('i')
  .action(require('./cmds/impersonate'));

commander
  .command('whoami','dump current user information')
  .alias('?')
  .action(require('./cmds/whoami'));

commander
  .command('accounts','list visible accounts')
  .alias('a')
  .action(require('./cmds/accounts'));

commander
  .command('collections','list collections for an account')
  .alias('c')
  .action(require('./cmds/collections'));

commander
  .command('things','list things for an account or collection')
  .alias('t')
  .action(require('./cmds/things'));

commander
  .command('messages [thing_token]','list most recent messages')
  .alias('m')
  .action(require('./cmds/messages'));

commander
  .command('rest <method> <uri> [body]','make a REST api call')
  .action(require('./cmds/rest'));

commander
  .command('log <thing_token> <message>','log a message for a thing')
  .alias('l')
  .action(require('./cmds/log'));

commander
  .command('receive <thing_token>','receive the mailbox entry for a thing')
  .alias('r')
  .action(require('./cmds/receive'));

commander
  .command('send <thing_token> <message>','send a message to the mailbox for a thing')
  .alias('s')
  .action(require('./cmds/send'));

commander.parse(process.argv);
