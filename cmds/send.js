var proxyutils = require('../lib/proxy-utils');

module.exports = function(thing_token,message){ return proxyutils.post(arguments,'/1/m/' + thing_token,message); };
