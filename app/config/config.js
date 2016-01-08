var uuid = require('node-uuid');
var uuidgen=uuid.v4();
module.exports = {
    'numeroPreguntas':9,
	'secret': uuidgen,
	'database': 'mongodb://localhost/MagniDB',
	'cacheEnabled':true
};