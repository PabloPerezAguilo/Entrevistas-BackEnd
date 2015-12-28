var userController = require("../controllers/user");
var authRole = require("../controllers/authRole");
var interviewController = require("../controllers/interviewController");
var questionController = require("../controllers/questionController");
var tagController = require("../controllers/tagController");

var log4js = require('log4js');
var log = log4js.getLogger("userRoutes");

module.exports = function(router) {
	log.debug("Load private!");

	return router; 
};