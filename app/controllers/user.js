// Load required packages
var User = require('../models/user');
var log4js = require('log4js');
var log = log4js.getLogger("userCtrl");
var daoUser = require("../DAO/daoUser");
var ldapAuth = require('ldapauth-fork');
var config = require("../config/config");


// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
    var newUser = new User({
        username: req.body.username
    });
    
    if (req.body.role=="tecnico" ){
        newUser.role= "ROLE_TECH";
    }else if (req.body.role=="administrador" ){
        newUser.role= "ROLE_ADMIN";
    }
    var options = {
        url: config.ldap,
        searchBase: "ou=People,o=gfi-info.com",
        searchFilter: "(uid={{username}})",
        searchAttributes: ["uid", "cn"]
    };
    try{
        var ldap = new ldapAuth(options);
    
        ldap._findUser(newUser.username, function(err, user) {
            if (err){
                log.debug("LDAP user error: %s", err);
                res.send(err);
            }else if(user == undefined || user.length==0){
                res.status(400).json({success: false, message: "No user found in ldap with uid " + newUser.username});
            }else{
                newUser.cn=user.cn;
                daoUser.postUser(newUser,function(err) {
                    if (err){
                        log.debug("Error at possting the user which username is " + newUser.username + " from data base: " + err); 
                        res.status(400).send(err);
                    }else {
                        res.json({ message: 'New user created!', data: newUser });
                    }
                });
            }
            ldap.close(function(err) {
                if (err){
                    console.log(err);
                }
            })
        });
    }catch(err){
        log.debug("Error de conexion con ldap " + err);
    }
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
    var role = req.param("role");
    var nick = req.param("nick");
    
    console.log(nick + " " + role)

    
    if (role == undefined || role.length==0){
        daoUser.getUsers(function(err, datos) {
            if (err){
                log.debug("Error at getting the users"); 
                res.status(400).send(err);
            }else {
                res.json(datos);
            }
        });
    }else {
        if(nick == undefined || nick.length==0){
            daoUser.getUsersByRole(role,function(err, datos) {
                if (err){
                    log.debug("Error at getting the users"); 
                    res.status(400).send(err);
                }else {
                    res.json(datos);
                }
            });
        }else{
            daoUser.getUsersByRoleAndNick(role,nick,function(err, datos) {
                if (err){
                    log.debug("Error at getting the users"); 
                    res.status(400).send(err);
                }else {
                    res.json(datos);
                }
            });
        }
    }

};

exports.deleteUser = function(req, res) {
    
    var username= req.body.username
    daoUser.deleteUser(username, function(err, datos) {
        if (err){
            log.debug("Error at getting the users"); 
            res.status(400).send(err);
        }else {
            res.json(datos);
        }
    });
};