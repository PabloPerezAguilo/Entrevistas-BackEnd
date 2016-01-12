var uuid = require('node-uuid');
var uuidgen=uuid.v4();
module.exports = {
    'numeroPreguntas':8,
	'secret': uuidgen,
	'database': 'mongodb://localhost/MagniDB',
	'cacheEnabled':true
};