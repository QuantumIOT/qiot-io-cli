var _ = require('lodash');

var CMD = require('../lib/cmd');
var HOST = require('../lib/host');
var API = require('../lib/api');

module.exports = function(method,path,body){
  var cmd = new CMD();

  method = method.toUpperCase();
  cmd.options.body = body;

  var defn = findDefn(cmd.config.settings,method,path,body);
  if (defn) return API.executeDefn(arguments,defn);

  var host = new HOST(HOST.AUTH_USER);

  var callback = cmd.ensureGoodCallback(arguments);

  host.request({method: method, path: path},body).catch(callback).then(function(result){
    cmd.safeguard(callback,function() {
      if (result.statusCode !== HOST.allCodes.OK) return callback(HOST.describeResult(result));

      cmd.dumpObject(result.data);

      callback(null);
    });
  });
};

function findDefn(settings,method,path,body){
  return _.find(API.defns,function(entry){
    return method === entry.method &&
      new RegExp('^' + API.adjustPath(entry,settings).replace(/{\w+}/g,'\\w+') + '$').test(path) &&
      entry.body === !!body;
  })
}

module.exports.findDefn = findDefn;