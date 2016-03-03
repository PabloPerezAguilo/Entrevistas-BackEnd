var uuid = require("node-uuid");
var uuidgen=uuid.v4();
module.exports = {
    "paginacion": 7, //Numnero de entrevistas que aparecen por pagina
	"secret": uuidgen,
	"database": "mongodb://localhost/MagniDB",
    "mongo_usr":"Magni",
    "mongo_pass":"4rg0s",
    "ldap": "ldap://ldap.gfi-info.com:389",
	"cacheEnabled": true
};