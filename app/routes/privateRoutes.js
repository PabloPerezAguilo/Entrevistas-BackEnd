var userController = require("../controllers/user");
var authRole = require("../controllers/authRole");

var log4js = require('log4js');
var log = log4js.getLogger("userRoutes");

module.exports = function(router) {
	log.debug("Load private!");
// ----------------------------------------------------------------------------------------------------------------------------
// 												User
// ----------------------------------------------------------------------------------------------------------------------------
	router.route("/user")
		.get(authRole.isAdminRole,userController.getUsers);
	
	return router;
};