var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(){
  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  if (cmd.options[cmd.COLLECTION_OPTION]) return thingsForCollection(cmd,host,callback);
  if (cmd.options[cmd.ACCOUNT_OPTION])    return thingsForAccount(cmd,host,callback);

  if (cmd.bestOption(cmd.COLLECTION_OPTION))  return thingsForCollection(cmd,host,callback);
  if (cmd.bestOption(cmd.ACCOUNT_OPTION))     return thingsForAccount(cmd,host,callback);

  callback('no collection or account found');
};

function thingsForCollection(cmd,host,callback){
  host.get('/users/collections/' + cmd.options[cmd.COLLECTION_OPTION] + '/collection+things').then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK || !result.data.collection) return callback(HOST.allCodes.getStatusText(result.statusCode));

      cmd.dumpTable(['id', 'label', 'thing_token', 'collection_token', 'account_token', 'collection_id', 'last_reported_at', 'identities.0.type', 'identities.0.value'], result.data.collection.things);

      callback(null);
    });
  },callback);
}

function thingsForAccount(cmd,host,callback){
  host.get('/users/accounts/' + cmd.options[cmd.ACCOUNT_OPTION] + '/things').then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK || !result.data.things) return callback(HOST.allCodes.getStatusText(result.statusCode));

      cmd.dumpTable(['id', 'label', 'thing_token', 'collection_token', 'account_token', 'collection_id', 'last_reported_at', 'identities.0.type', 'identities.0.value'], result.data.things);

      callback(null);
    });
  },callback);
}