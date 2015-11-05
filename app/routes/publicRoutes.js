var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var userController = require("../controllers/user");
var questionController = require("../controllers/questionController");
var User = require("../models/user");

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
	
// --------------------------------------------------------------------------------------------------------------------------
// 															question
// --------------------------------------------------------------------------------------------------------------------------
	
// http://localhost:9600/api/question
	router.route("/question")
		.get(questionController.getQuestions)
		.post(questionController.postQuestion);
    router.route("/question/:question_id")
		.get(questionController.getQuestion);

// -------------------------------------------------------------------------------------------------------------------------
// 														authentication 
// -------------------------------------------------------------------------------------------------------------------------

// http://localhost:9600/api/authenticate
	router.route("/authenticate").post(function(req, res) {
		
		// find the user
		User.getUser(req.body.username, function(err, user) {
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
	
	return router;
};