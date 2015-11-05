var config = require("../config/config");
var log4js = require('log4js');
var log = log4js.getLogger("authRole");

exports.isAdminRole = function(req, res, next){
     if("ROLE_ADMIN"==req.decoded.role){
        next();
     }else{
        return res.status(403).send({ 
            success: false, 
            message: 'Not permision.'
        });
    } 
};

exports.isTechRole = function (req, res, next){
    if("ROLE_TECH"==req.decoded.role){
        next();
     }else{
        return res.status(403).send({ 
            success: false, 
            message: 'Not permision.'
        });
    }
};