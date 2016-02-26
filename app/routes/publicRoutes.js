var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var userController = require("../controllers/user");
var interviewController = require("../controllers/interviewController");
var questionController = require("../controllers/questionController");
var tagController = require("../controllers/tagController");
var ldapController = require("../controllers/LDAPController");
var daoUser = require("../DAO/daoUser");
var atob = require('atob');

var log4js = require('log4js');
var log = log4js.getLogger("publicRoutes");

module.exports = function(router,app) {
	 log.debug("Load public!");

    router.route("/valoracion")
        .post(interviewController.postValoracion);
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
                    user.verifyPassword(atob(req.body.password), function(err,cb) {
                        if(err){
                          res.status(500).json({ success: false, message: 'Authentication failed. Error in validate password.', error:err });
                        }else{
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
    
        
//----------------------------------------------------
    
    router.route("/ldap")
        .post(ldapController.LDAP);
    
    router.route("/ldapUsers")
        .get(ldapController.ldapUsers);
    
    router.route("/ldapUser")
        .post(ldapController.ldapUser);
    
	return router;
};