var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var userController = require("../controllers/user");
var interviewController = require("../controllers/interviewController");
var questionController = require("../controllers/questionController");
var tagController = require("../controllers/tagController");
var daoUser = require("../DAO/daoUser");

var log4js = require('log4js');
var log = log4js.getLogger("publicRoutes");

module.exports = function(router,app) {
	 log.debug("Load public!");
// --------------------------------------------------------------------------------------------------------------------------
// 															User
// --------------------------------------------------------------------------------------------------------------------------

// http://localhost:9600/api/user
	router.route("/user")
		.post(userController.postUsers);
     
	

// -------------------------------------------------------------------------------------------------------------------------
// 														authentication 
// -------------------------------------------------------------------------------------------------------------------------


// http://localhost:9600/api/authenticate
	router.route("/authenticate")
        .post(function(req, res) {
            // find the user
            daoUser.getUser(req.body.username, function(err, user) {
                if (err){
                 throw err;   
                }
                if (!user) {
                    res.status(400).json({ success: false, message: 'Authentication failed. User not found.' });
                } else if (user) {

                    // check if password matches
                    user.verifyPassword(req.body.password, function(err,cb) {
                        if(err){
                          res.status(500).json({ success: false, message: 'Authentication failed. Error in validate password.' });
                        }
                        if(!cb){
                          res.status(400).json({ success: false, message: 'Authentication failed. Wrong password.' });
                        }

                       else{
                        var userJWT= {username: user.username, role:user.role, _id: user._id };
                        // if user is found and password is right
                        // create a token
                            var token = jwt.sign(userJWT, app.get('superSecret'), {
                            expiresInMinutes: 1440 // 1440 min - expires in 24 hours
                            });

                            console.log(token);
                            res.json({
                                success: true,
                                message: 'Enjoy your token!',
                                role: user.role,
                                token: token
                            });
                        }
                    });		
                }

            });
	   });
    
//-----------------------------------------------------------------------------------------------------
//              DEVELOPE ROUTES
//  This routes should be private, but for developing, are public until the feature is done
//-----------------------------------------------------------------------------------------------------
	
router.route("/interview/:DNI")
    .get(interviewController.getInterview)
    

router.route('/tag')
    .get(/*authRole.isAdminOrTech ,*/ tagController.getTags)
    .post(/*authRole.isTechRole,*/  tagController.postTag);

router.route("/tag/:tag_id")
    .delete(/*authRole.isAdminOrTech,*/ tagController.deleteTag);
    
// ------------------------------------------------------------------------------------------------------
// 													question
// ------------------------------------------------------------------------------------------------------
router.route("/question")
    .get(/*authRole.isTechRole,*/ questionController.getQuestions)
    .post(/*authRole.isTechRole,*/ questionController.postQuestion);

router.route("/question/:question_id")
    .get(/*authRole.isTechRole,*/ questionController.getQuestion)
    .put(/*authRole.isTechRole,*/ questionController.putQuestion)
    .delete(/*authRole.isTechRole,*/ questionController.deleteQuestion);

router.route("/questionByTags")
    .post(/*authRole.isAdminOrTech,*/ questionController.getQuestionByTag);
    
router.route('/QuestionsByLevel')//este servicio no se usa en version nfinal
    .post(/*authRole.isAdminOrTech ,*/ questionController.getQuestionsByLevelRange);
    
    	
//-------------------------------------------------------------------------------------------------------
//  					                           Interview
//-------------------------------------------------------------------------------------------------------
router.route("/interview/:DNI")
    .delete(/*authRole.isAdminRole,*/ interviewController.deleteInterview);

 router.route("/interview")
    .post(/*authRole.isAdminRole,*/ interviewController.postInterview)
    .get(/*authRole.isAdminRole,*/ interviewController.getInterviews);


	
	return router;
};