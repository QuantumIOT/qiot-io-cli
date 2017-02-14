# qiot-io-cli [![Build Status](https://travis-ci.org/QuantumIOT/qiot-io-cli.svg?branch=master)](https://travis-ci.org/QuantumIOT/qiot-io-cli) [![Coverage Status](https://coveralls.io/repos/github/QuantumIOT/qiot-io-cli/badge.svg?branch=master)](https://coveralls.io/github/QuantumIOT/qiot-io-cli?branch=master)



### Overview
The `qiot-io-cli` allows an authorized user to access the APIs for any instance of the `qiot-io` platform.

### Command Summary

```
  Usage: qc [options] <command> ...

  Commands:

    init [options]                       initialize general configuration settings
    signin|si [email] [password]         signin a local user with email and password
    impersonate|i [userid]               impersonate a userid, or clear impersonation if none provided
    whoami|?                             dump current user information
    accounts|a                           list visible accounts
    collections|c                        list collections for an account
    things|t [options]                   list things for an account or collection
    users|u                              list users
    messages|ms [options] [thing_token]  list most recent messages
    rest <method> <path> [body]          make a REST api call
    register|r [options] <identity>      register a thing with an identity in the form of [<type>:]<value>[,[<type>:]<value>...]
    log|l <thing_token> <message>        log a message for a thing
    mailbox|mb <thing_token> [message]   receive the mailbox entry for a thing without a message, send with one
    fota <thing_token> <url>             send an appropriately formatted FOTA mailbox message to the thing (experimental)
    socket|io <service> <event> <data>   connect using socket.io to a service
    mqtt|mq <thing_token>                connect using an MQTT client for a thing

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -a --account <id-or-token>     target account (save-able)
    -c --collection <id-or-token>  target collection (save-able)
    -n --limit <number>            limit used for some queries
    -s --save                      remember the applicable options as "current"
    --clear                        forget the applicable options as "current"
    --raw                          do not output any ansi special characters
    --csv                          output query results to CSV format
    --tsv                          output query results to TSV format
    --json                         output query results in JSON format
    --silent                       do not output query results
    --debug                        turn on debugging for this command
    --timestamps                   add timestamps to logs
    -v --verbose                   display maximal output


```

One special note: Anywhere that a "thing_token" is specified as a command line argument,
you may use the special symbol `@` to represent a "current thing" stored in the configuration file.
This "current thing" can be captured automatically with the `qc register` command and the `--save` option.

A few commands have command-specific options such as the following:

##### init

```
  Usage: init [options]

  initialize general configuration settings

  Options:

    -h, --help  output usage information
    --defaults  prompt with defaults instead of current settings
    --reset     reset settings to defaults
```

##### messages
```
  Usage: messages|ms [options] [thing_token]

  list most recent messages

  Options:

    -h, --help                 output usage information
    -f --filter <field-names>  a comma-separated list of field labels to display    
    --socket                   message socket only available when a thing_token is given
    --from <datetime>          return messages after the given datetime
    --to <datetime>            return messages before the given datetime
```

##### things
```
  Usage: things|t [options]

  list things for an account or collection

  Options:

    -h, --help  output usage information
    --socket  thing socket only available when an account is given
```

### Getting Started

##### Install

You can install globally as follows:

```
npm install qiot-io-cli -g
```

##### Configure

Start by using `qc init` to setup your initial configuration settings.

If you are accessing the standard public site as a user, you can accept the defaults.

If you want to access the "thing-proxy" to simulate device communications,
you will need to provide an `account_token` --
you can find your `account_token` on the settings page when logging in as a web user.

This information is stored in the current working directory called `.qc.json`.

NOTE: `qc` is sensitive to current working directory where `.qc.json` is stored.
this allows you to have different profiles for execution by changing working directory.

##### Sign In or Capture API Token

If you are a superadmin on your `qiot.io` deployment,
use `qc signin` to sign in to the services layer to receive a `user_token` that will be used
to authenticate your API requests.

NOTE: At this time, only local users are able to use the `qc signin` command.

Otherwise, you can capture the "API Token" to clipboard on the "Settings" page of the web application.
Paste this as the `user_token` when prompted in the `qc init` command. 

### Next Steps

* Support loading message bodies from the file system
* Support centralized storage of multiple profiles
* Support more/all REST actions of the API (e.g., PUT (more), PATCH, DELETE)

### Tips and Tricks

##### servers

If you are running development instances of the `qiot-io` services, you can manually change the `.qc.json` configuration file
to reference all APIs and socket endpoints (e.g., MQTT and socket.io) on localhost.
To do this you need to make the following changes:

```json
{
  "host_service": "http",
  "host_dns":     "localhost",
  "host_port":    3000,
  "proxy_dns":    "localhost",
  "mqtt_protocol":"mqtt",
  "mqtt_port":    1883
}
```

##### mqtt

The `qc mqtt` command will accept a JSON message payload when prompted and will 1) verify that the JSON is valid and 2) put add it as the contents of `{"messages":[ ... ]}` to construct a properly complete message to the server.
However, sometimes you might want to test _invalid JSON_ so simply use the `--raw` option when executing the command,
but keep in mind that you will then be required to include the _full_ message payload if needed.

### How to contribute?

You are welcome to help add/extend this tool.

To do so, please use pull requests and follow the general style of the code already in place.

For a pull request to be accepted, it _must_ maintain the commitment to 100% code coverage.

_*NOTE*: This tool is designed to run using node v4.5.0 in order to support embedded Linux.
This means that *ES6 syntax* should *NOT* be used._

Thanks!