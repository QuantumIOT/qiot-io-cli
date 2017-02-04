var fs = require('fs');
var commander = require('commander');
var events = require('events');

// events.defaultMaxListeners = 12; // NOTE - bump up due to many command definitions

var helpers = require('./lib/helpers');

var usage = '[options] <command> ...';

commander
  .version(helpers.readJSON('package.json',{},{}).version)
  .usage(usage)
  .option('-a --account <id-or-token>','target account (save-able)')
  .option('-c --collection <id-or-token>','target collection (save-able)')
  .option('-n --limit <number>','limit used for some queries')
  .option('-s --save','remember the applicable options as "current"')
  .option('--clear','forget the applicable options as "current"')
  .option('--raw','do not output any ansi special characters')
  .option('--csv','output query results to CSV format')
  .option('--tsv','output query results to TSV format')
  .option('--json','output query results in JSON format')
  .option('--silent','do not output query results')
  .option('--debug','turn on debugging for this command')
  .option('--timestamps','add timestamps to logs')
  .option('-v --verbose','display maximal output');

commander
  .command('init')
  .option('--defaults','prompt with defaults instead of current settings')
  .option('--reset','reset settings to defaults')
  .description('initialize general configuration settings')
  .action(require('./cmds/init'));

commander
  .command('signin [email] [password]')
  .description('signin a local user with email and password')
  .alias('si')
  .action(require('./cmds/signin'));

commander
  .command('impersonate [userid]')
  .description('impersonate a userid, or clear impersonation if none provided')
  .alias('i')
  .action(require('./cmds/impersonate'));

commander
  .command('whoami')
  .description('dump current user information')
  .alias('?')
  .action(require('./cmds/whoami'));

commander
  .command('accounts')
  .description('list visible accounts')
  .alias('a')
  .action(require('./cmds/accounts'));

commander
  .command('collections')
  .description('list collections for an account')
  .alias('c')
  .action(require('./cmds/collections'));

commander
  .command('things')
  .description('list things for an account or collection')
  .alias('t')
  .option('--socket','thing socket only available when an account is given')
  .action(require('./cmds/things'));

commander
  .command('users')
  .description('list users')
  .alias('u')
  .action(require('./cmds/users'));

commander
  .command('messages [thing_token]')
  .description('list most recent messages')
  .alias('ms')
  .option('--socket','message socket only available when a thing_token is given')
  .action(require('./cmds/messages'));

commander
  .command('rest <method> <path> [body]')
  .description('make a REST api call')
  .action(require('./cmds/rest'));

commander
  .command('log <thing_token> <message>')
  .description('log a message for a thing')
  .alias('l')
  .action(require('./cmds/log'));

commander
  .command('mailbox <thing_token> [message]')
  .description('receive the mailbox entry for a thing without a message, send with one')
  .alias('mb')
  .action(require('./cmds/mailbox'));

commander
  .command('fota <thing_token> <url>')
  .description('send an appropriately formatted FOTA mailbox message to the thing (experimental)')
  .action(require('./cmds/fota'));

commander
  .command('socket <service> <event> <data>')
  .description('connect using socket.io to a service')
  .alias('io')
  .action(require('./cmds/socket'));

commander
  .command('mqtt <thing_token>')
  .description('connect using an MQTT client for a thing')
  .alias('mq')
  .action(require('./cmds/mqtt'));

commander
  .action(function(env){
    console.log('unknown command: ' + JSON.stringify(env));
  });

commander.parse(process.argv);

if (process.argv.length <= 2) console.log('usage: qc ' + usage + ' (option -h for details)');
