var userController = require("../controllers/user");
var authRole = require("../controllers/authRole");
var interviewController = require("../controllers/interviewController");
var questionController = require("../controllers/questionController");
var tagController = require("../controllers/tagController");

var log4js = require('log4js');
var log = log4js.getLogger("userRoutes");

module.exports = function(router) {
	log.debug("Load private!");
// ------------------------------------------------------------------------------------------------------
// 													User
// ------------------------------------------------------------------------------------------------------
	router.route("/user")
		.get(authRole.isAdminRole,userController.getUsers);
    
    
    
// ------------------------------------------------------------------------------------------------------
// 													question
// ------------------------------------------------------------------------------------------------------
router.route("/question")
    .get(authRole.isTechRole, questionController.getQuestions)
    .post(authRole.isTechRole, questionController.postQuestion);

router.route("/question/:question_id")
    .get(authRole.isTechRole, questionController.getQuestion)
    .put(authRole.isTechRole, questionController.putQuestion)
    .delete(authRole.isTechRole, questionController.deleteQuestion);

router.route("/questionByTags")
    .post(authRole.isAdminOrTech, questionController.getQuestionByTag);
    
router.route('/QuestionsByLevel')//este servicio no se usa en version nfinal
    .post(authRole.isAdminOrTech , questionController.getQuestionsByLevelRange);
    
    

//-------------------------------------------------------------------------------------------------------
//  					                           Interview
//-------------------------------------------------------------------------------------------------------
router.route("/interview/:DNI")
    .delete(authRole.isAdminRole, interviewController.deleteInterview);

 router.route("/interview")
    .post(authRole.isAdminRole, interviewController.postInterview)
    .get(authRole.isAdminRole, interviewController.getInterviews);

//-------------------------------------------------------------------------------------------------------
//  					                           TAG
//-------------------------------------------------------------------------------------------------------
router.route('/tag')
    .get(authRole.isAdminOrTech , tagController.getTags)
    .post(authRole.isTechRole,  tagController.postTag);

router.route("/tag/:tag_id")
    .delete(authRole.isAdminOrTech, tagController.deleteTag);

    	

	return router; 
};