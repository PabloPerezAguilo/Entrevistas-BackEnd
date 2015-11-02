var log4js = require('log4js');
var log = log4js.getLogger("authRole");

exports.isAdminRole = function(req, res,next) {	
         if(req.decoded.role==="ROLE_ADMIN"){
         	next();
         }else{
         	return res.status(403).send({ 
			success: false, 
			message: 'Not permision.'
		});
     }
};