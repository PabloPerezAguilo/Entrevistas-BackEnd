var config = require("../config/config");
var log4js = require('log4js');
var log = log4js.getLogger("authRole");

exports.isAdminRole = function(req, res, next){
     if(config.ROLE_ADMIN==req.decoded.role){
        next();
     }else{
        return res.status(403).send({ 
            success: false, 
            message: 'Not permision.'
        });
    } 
};

exports.isTechrole = function (req, res, next){
    if(config.ROLE_TECH==req.decoded.role){
        next();
     }else{
        return res.status(403).send({ 
            success: false, 
            message: 'Not permision.'
        });
    }
};