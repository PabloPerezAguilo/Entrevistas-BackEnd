var userController = require("../controllers/user");
var authRole = require("../controllers/authRole");
var interviewController = require("../controllers/interviewController");
var questionController = require("../controllers/questionController");

var log4js = require('log4js');
var log = log4js.getLogger("userRoutes");

module.exports = function(router) {
	log.debug("Load private!");
// ----------------------------------------------------------------------------------------------------------------------------
// 													User
// ----------------------------------------------------------------------------------------------------------------------------
	router.route("/user")
		.get(authRole.isAdminRole,userController.getUsers);

	
//-------------------------------------------------------------------------------------------------------
//  					                           Interview
//-------------------------------------------------------------------------------------------------------
    router.route("/interview")
        .get(authRole.isAdminRole, interviewController.getInterviews)
        .post(authRole.isAdminRole, interviewController.postInterview)
	
// --------------------------------------------------------------------------------------------------------------------------
// 													question
// --------------------------------------------------------------------------------------------------------------------------
	router.route("/question")
		.get(authRole.isTechRole, questionController.getQuestions)
		.post(authRole.isTechRole, questionController.postQuestion);
	
    router.route("/question/:question_id")
		.get(authRole.isTechRole, questionController.getQuestion)
		.put(authRole.isTechRole, questionController.putQuestion)
		.delete(authRole.isTechRole, questionController.deleteQuestion);
	
	return router;
};