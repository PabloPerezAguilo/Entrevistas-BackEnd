// Load required packages
var User = require('../models/user');
var log4js = require('log4js');
var log = log4js.getLogger("userCtrl");
var daoUser = require("../DAO/daoUser");

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role 
  });

  daoUser.postUser(user,function(err) {
        if (err){
           	log.debug("Error at possting the user which username is "+user.username+" from data base: "+err); 
            res.status(400).send(err);
        }else {
			res.json({ message: 'New user created!', data: user });
		}
  	}); 
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
        console.log("getUsers with Permision Admin!");
        daoUser.getUsers(function(err, datos) {
            if (err){
                log.debug("Error at getting the users"); 
                res.status(400).send(err);
            }else {
                res.json(datos);
            }
        });
};