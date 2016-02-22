var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var log = log4js.getLogger("daoUser");

var userModel = require('../models/user');

exports.postUser = function (user,cb){
	user.save(function(err) {
        cb(err);
  	});	
};

exports.getUsers = function (cb){
	userModel.find({ },function(err, datos) {
        cb(err,datos);
  	});	
};

exports.getUser = function (username,cb){
	userModel.findOne({username: username},function(err, datos) {
        cb(err, datos);
  	});	
};

exports.getUsersByRole = function (userRole,cb){
	userModel.find({role: userRole},function(err, datos) {
        cb(err, datos);
  	});	
};

exports.getUsersByRoleAndNick = function (userRole, nick,cb){
	userModel.find({username: nick, role: userRole},function(err, datos) {
        cb(err, datos);
  	});	
};

exports.deleteUser = function (id, cb){
	userModel.remove({username:id}, function(err, result) {
        cb(err, result);
  	});
};