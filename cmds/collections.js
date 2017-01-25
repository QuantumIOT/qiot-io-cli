var API = require('../lib/api');

module.exports = function(){ return API.executeDefn(arguments,API.findDefn({command: 'collections'})); };
