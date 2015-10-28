var uuid = require('node-uuid');
var uuidgen=uuid.v4();
module.exports = {
	'secret': uuidgen,
	'database': 'mongodb://localhost/apinode',
	'cacheEnabled':true
};