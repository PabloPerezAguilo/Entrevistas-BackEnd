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
    // ------------------------------------------------------------------------------------------------------
    // 															User
    // ------------------------------------------------------------------------------------------------------

    // http://localhost:9600/api/user
	router.route("/user")
		.post(userController.postUsers);



    // ------------------------------------------------------------------------------------------------------
    // 														authentication 
    // ------------------------------------------------------------------------------------------------------


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
    
//-------------------------------------------------------------------------------------------------------
    //              DEVELOPE ROUTES
    //  This routes should be private, but for developing, are public until the feature is done
    //-------------------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------------------
    // 													User
    // ------------------------------------------------------------------------------------------------------
    router.route("/user")
            .get(userController.getUsers);

    // ------------------------------------------------------------------------------------------------------
    // 													question
    // ------------------------------------------------------------------------------------------------------
    router.route("/question")
        .get(questionController.getQuestions)
        .post(questionController.postQuestion);

    router.route("/question/:question_id")
        .get(questionController.getQuestion)
        .put(questionController.putQuestion)
        .delete(questionController.deleteQuestion);

    router.route("/questionByTags")
        .post(questionController.getQuestionByTag);

    router.route('/questionsByLevel')//este servicio no se usa en version nfinal
        .post(questionController.getQuestionsByLevelRange);

    //-------------------------------------------------------------------------------------------------------
    //  					                           Interview
    //-------------------------------------------------------------------------------------------------------

     router.route("/interview")
        .post(interviewController.postInterview)
        .get(interviewController.getInterviews);

    router.route("/interviewNames")
        .get(interviewController.getNames);

    router.route("/interview/:fullName")
        .get(interviewController.getInterview);

    router.route("/interview/:interview_id")
        .delete(interviewController.deleteInterview);

    router.route("/interviewQuestions/:interview_id")
        .get(interviewController.getInterviewQuestions);

    //-------------------------------------------------------------------------------------------------------
    //  					                           TAG
    //-------------------------------------------------------------------------------------------------------
    router.route('/tag')
        .get(tagController.getTags)
        .post(tagController.postTag);

    router.route("/tag/:tag_id")
        .delete(tagController.deleteTag);
    
	return router;
};