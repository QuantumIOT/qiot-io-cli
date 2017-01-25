var _ = require('lodash');

var CMD = require('./cmd');
var HOST = require('./host');

var API = {};

API.defns = [];

API.addDefn = function(auth_type,method,path,params,body,command,expect_code,expect_data,table_fields){
  API.defns.push({
    method:             method.toUpperCase(),
    path:               path,
    params:             params,
    body:               body,
    auth_type:          auth_type,
    command:            command,
    expect_code:        expect_code,
    expect_data:        _.concat([],expect_data || []),
    table_fields:       table_fields,
    required_options:   _.concat(pathArgs(path),body ? params : [])
  })
};

var ACCOUNT_FIELDS    = ['id','name','token_identifier','token_secret','account_token','users.0.id','users.0.email'];
var COLLECTION_FIELDS = ['id','name','auth_token'];
var MESSAGE_FIELDS    = ['accountToken','thingToken','id','message.time'];
var THING_FIELDS      = ['id','label','thing_token','collection_token','account_token','collection_id','last_reported_at','identities.0.type','identities.0.value'];
var USER_FIELDS       = ['id','name','email','account_id','role.name','oauth_provider'];

var ACCOUNTS_URL          = '/users/accounts';
var COLLECTIONS_URL       = '/users/accounts/{account}/collections';
var SIGNIN_URL            = '/users/signin';
var RESET_USER_URL        = '/users/users/reload';
var IMPERSONATE_URL       = '/users/users/{userid}/impersonate';
var LOG_URL               = '/1/l/{thing_token}';
var MAILBOX_URL           = '/1/m/{thing_token}';
var MESSAGES_URL          = '/messages';
var COLLECTION_THINGS_URL = '/users/collections/{collection}/collection+things';
var ACCOUNT_THINGS_URL    = '/users/accounts/{account}/things';
var USERS_URL             = '/users';

//          auth           method path                  params                  body  command       expect_code             expect_data                    table_fields
API.addDefn(HOST.AUTH_USER,'get', ACCOUNTS_URL,         [],                     false,'accounts',   HOST.allCodes.OK,       'accounts',                    [ACCOUNT_FIELDS]);
API.addDefn(HOST.AUTH_USER,'get', COLLECTIONS_URL,      [],                     false,'collections',HOST.allCodes.OK,       'collections',                 [COLLECTION_FIELDS]);
API.addDefn(null,          'post',SIGNIN_URL,           ['email','password'],   true, 'signin',     HOST.allCodes.OK,       'token',                       null);
API.addDefn(HOST.AUTH_USER,'put', RESET_USER_URL,       [],                     false,'impersonate',HOST.allCodes.OK,       'token',                       null);
API.addDefn(HOST.AUTH_USER,'put', IMPERSONATE_URL,      [],                     false,'impersonate',HOST.allCodes.OK,       'token',                       null);
API.addDefn(HOST.AUTH_ACCT,'post',LOG_URL,              [],                     true ,'log',        HOST.allCodes.NO_CONTENT,null,                         null);
API.addDefn(HOST.AUTH_ACCT,'get', MAILBOX_URL,          [],                     false,'mailbox',    HOST.allCodes.OK,        null,                         null);
API.addDefn(HOST.AUTH_ACCT,'post',MAILBOX_URL,          [],                     true ,'mailbox',    HOST.allCodes.NO_CONTENT,null,                         null);
API.addDefn(HOST.AUTH_USER,'get', MESSAGES_URL,         ['thing_token','limit'],false,'messages',   HOST.allCodes.OK,        ['messages','binaryMessages'],[MESSAGE_FIELDS,MESSAGE_FIELDS]);
API.addDefn(HOST.AUTH_USER,'get', COLLECTION_THINGS_URL,[],                     false,'things',     HOST.allCodes.OK,        'collection.things',          [THING_FIELDS]);
API.addDefn(HOST.AUTH_USER,'get', ACCOUNT_THINGS_URL,   [],                     false,'things',     HOST.allCodes.OK,        'things',                     [THING_FIELDS]);
API.addDefn(HOST.AUTH_USER,'get', USERS_URL,            [],                     false,'users',      HOST.allCodes.OK,        'users',                      [USER_FIELDS]);

API.findDefn = function(required){
  return _.find(API.defns,function(defn){ return !_.find(required,function(value,key){ return defn[key].toString() !== value.toString(); }); });
};


API.executeDefn = function(args,defn){
  var cmd = new CMD();

  var callback = cmd.ensureGoodCallback(args);

  if (!defn)      return callback('no definition given');
  if (defn.error) return callback(defn.error);

  if (cmd.requireOptions(defn.required_options,callback)) return;

  var requestOptions = {method: defn.method};
  requestOptions.path = replaceArgs(defn.path,defn.required_options,cmd.options);
  if (defn.auth_type == HOST.AUTH_ACCT) requestOptions.host = cmd.config.settings.proxy_dns;

  var body = cmd.options.body;
  var params = _.pick(cmd.options,defn.params);
  if (_.keys(params).length > 0)
    if (defn.body)
      body = JSON.stringify(params);
    else
      requestOptions.path += '?' + _.toPairs(params).map(function(pair){ return pair[0] + '=' + pair[1]; }).join('&');

  var host = new HOST(defn.auth_type);

  host.request(requestOptions,body || null).then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== defn.expect_code) return callback(HOST.describeResult(result));

      if (result.statusCode == HOST.allCodes.OK)
        if (defn.expect_data.length == 0)
          cmd.dumpObject(result.data);
        else {

          var dataFound = _.filter(defn.expect_data,function(key){ return valueForKey(result.data,key); });
          if (dataFound.length < defn.expect_data.length) return callback('missing data: ' + _.difference(defn.expect_data,dataFound).join(', '));

          _.each(dataFound,function(dataKey,index){
            if (dataKey === 'token')
              cmd.establishUser(result.data.token);
            else {
              var data    = valueForKey(result.data,dataKey);
              var fields  = defn.table_fields[index];
              if (!fields)
                cmd.dumpObject(data);
              else if (data.length > 0)
                cmd.dumpTable(fields,data);
            }
          });
      }

      cmd.checkSaveClear(defn.required_options);

      callback(null);
    });
  },callback);
};

module.exports = API;

function pathArgs(path){
  var args = path.replace(/[^{}]*{(\w+)}[^{}]*/g,',$1').split(',');
  args.shift();
  return args;
}

function replaceArgs(path,keys,values){
  _.each(keys,function(key){ path = path.replace('{' + key + '}',values[key]) });
  return path;
}

function valueForKey(target,key){
  return target && eval('target.' + key);
}