var uuid = require('node-uuid');
var uuidgen=uuid.v4();
module.exports = {
	'secret': uuidgen,
	'database': 'mongodb://localhost/MagniDB',
	'cacheEnabled':true,
    'ROLE_ADMIN':'ROLE-ADMIN',
    'ROLE_TECH': 'ROLE_TECH'
};