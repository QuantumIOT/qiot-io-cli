# qiot-io-cli [![Build Status](https://circleci.com/gh/QuantumIOT/qiot-io-cli/tree/master.svg?style=shield&circle-token=431c98e778c22a698cdb6e5aa88b897ba1e95796)](https://circleci.com/gh/QuantumIOT/qiot-io-cli)


### Overview
The `qiot-io-cli` allows an authorized user to access the APIs for any instance of the `qiot-io` platform.

### Command Summary

```
  Usage: qc [options] <command> ...

  Commands:


  Commands:

    init [options]                      initialize general configuration settings
    signin|si [email] [password]        signin a local user with email and password
    impersonate|i [userid]              impersonate a userid, or clear impersonation if none provided
    whoami|?                            dump current user information
    accounts|a                          list visible accounts
    collections|c                       list collections for an account
    things|t                            list things for an account or collection
    users|u                             list users
    messages|ms [thing_token]           list most recent messages
    rest <method> <uri> [body]          make a REST api call
    log|l <thing_token> <message>       log a message for a thing
    mailbox|mb <thing_token> [message]  receive the mailbox entry for a thing without a message, send with one

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
    --timestamps                   add timestamps to logs
    -v --verbose                   display maximal output
```

Also, the `init` command has some special options:

```
  Usage: init [options]

  initialize general configuration settings

  Options:

    -h, --help  output usage information
    --defaults  prompt with defaults instead of current settings
    --reset     reset settings to defaults
```

### Getting Started

##### Install

You can install globally as follows:

```
npm install @qiot/qiot-io-cli -g
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
* Support socket-io endpoints
* More sophisticated support for FOTA/COTA

### How to contribute?

You are welcome to help add/extend this tool.

To do so, please use pull requests and follow the general style of the code already in place.

For a pull request to be accepted, it _must_ maintain the commitment to 100% code coverage.

_*NOTE*: This tool is designed to run using node v4.5.0 in order to support embedded Linux.
This means that *ES6 syntax* should *NOT* be used._

Thanks!