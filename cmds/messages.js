var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');

module.exports = function(thingToken){

  var cmd = new CMD();
  var host = new HOST(true);

  var callback = cmd.ensureGoodCallback(arguments);

  var endpoint = '/messages';

  var params = [];
  if (thingToken)         params.push('thing_token=' + thingToken);
  if (cmd.options.limit)  params.push('limit=' + cmd.options.limit);
  if (params.length > 0) endpoint += '?' + params.join('&');

  host.get(endpoint).then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK) return callback(HOST.describeResult(result));

      if (result.data.messages.length > 0)       cmd.dumpTable(['accountToken','thingToken','id','message.time'],result.data.messages);
      if (result.data.binaryMessages.length > 0) cmd.dumpTable(['accountToken','thingToken','id','message.time'],result.data.binaryMessages);

      callback(null);
    });
  },callback);
};