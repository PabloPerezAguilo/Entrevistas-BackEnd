var uuid = require('node-uuid');
var uuidgen=uuid.v4();
module.exports = {
    'numeropreguntas':12,
	'secret': uuidgen,
	'database': 'mongodb://localhost/MagniDB',
	'cacheEnabled':true
};