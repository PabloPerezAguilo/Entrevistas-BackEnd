var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../../app/models/user'); // get our mongoose model
var userController = require('../../app/controllers/user');
var productController = require('../../app/controllers/product');
var log4js = require('log4js');
var log = log4js.getLogger("routes-auth");
	// API routes
 module.exports = function(router,app) {

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
  router.route('/authenticate').post(function(req, res) {
	// find the user
	User.findOne({
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


router.route('/users')
  .post(userController.postUsers);


// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
router.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	// decode token
	if (token) {
     log.debug("Token: "+token);
		// verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				log.debug("Decoded :"+JSON.stringify(decoded));
				req.decoded = decoded;	
				next();
			}
		});
	} else {
		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
	}
});
return router;
};