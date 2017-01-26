var API = require('../lib/api');

module.exports = function(userid){
  var pattern = {command: 'impersonate'};

  if (userid) {
    require('commander').userid = userid;
    pattern.required_options = ['userid'];
  }

  return API.executeDefn(arguments,API.findDefn(pattern));
};
