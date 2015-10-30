var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../../app/models/user'); // get our mongoose model

var log4js = require("log4js");
var log = log4js.getLogger("routesAuth");
	
module.exports = function(router,app) {
	log.debug("Load authoritation!");
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
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.'
			});
		}
	});
	
	return router;
};