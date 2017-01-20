# qiot-io-cli [![Build Status](https://circleci.com/gh/QuantumIOT/qiot-io-cli/tree/master.svg?style=shield&circle-token=431c98e778c22a698cdb6e5aa88b897ba1e95796)](https://circleci.com/gh/QuantumIOT/qiot-io-cli)


### Overview
The `qiot-io-cli` allows an authorized user to access the APIs for any instance of the `qiot-io` platform.

### Command Summary

```
  Usage: qc [options] [command]

  Commands:

    init                                initialize general configuration settings
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
    -v --verbose                   display maximal output
```

### Getting Started

##### Configure

Start by using `qc init` to setup your initial configuration settings.

If you are accessing the standard public site as a user, you can accept the defaults.

If you want to access the "thing-proxy" to simulate device communications,
you will need to provide an `account_token` --
you can find your `account_token` on the settings page when logging in as a web user.

This information is stored in the current working directory called `.qc.json`.

##### Sign In

Next, use `qc signin` to sign in to the services layer to receive a `user_token` that will be used
to authenticate your API requests.

NOTE: At this time, only local users are able to use the `qc signin` command.