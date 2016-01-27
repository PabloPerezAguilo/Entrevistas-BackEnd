var uuid = require('node-uuid');
var uuidgen=uuid.v4();
module.exports = {
    'paginacion': 7,
    'numeroPreguntas':4,
	'secret': uuidgen,
	'database': 'mongodb://localhost/MagniDB',
	'cacheEnabled':true
};