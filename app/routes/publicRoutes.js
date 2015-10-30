var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var userController = require("../controllers/user");
var user = require("../models/user");

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
	router.route("/authenticate").post(function(req, res) {
		// find the user
		user.findOne({
			username: req.body.username
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Authentication failed. User not found.' });
			} else if (user) {

				// check if password matches
				user.verifyPassword(req.body.password, function(err,cb) {
					if(err){
					  res.json({ success: false, message: 'Authentication failed. Error in validate password.' });
					}
					if(!cb){
					  res.json({ success: false, message: 'Authentication failed. Wrong password.' });
					}

				   else{
					var userJWT= {username: user.username, admin:user.admin, _id: user._id };
					// if user is found and password is right
					// create a token
						var token = jwt.sign(userJWT, app.get('superSecret'), {
						expiresInMinutes: 1440 // 1440 min - expires in 24 hours
						});

						console.log(token);
						res.json({
							success: true,
							message: 'Enjoy your token!',
							token: token
						});
					}
				});		

			}

		});
	});
	
	return router;
};