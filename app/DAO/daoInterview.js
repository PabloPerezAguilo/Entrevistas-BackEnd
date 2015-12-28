var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var log = log4js.getLogger("daoInterview");

var interviewModel = require('../models/interviewModel');

exports.postInterview = function (interview,cb){
	interview.save(function(err) {
        cb(err);
  	});	
};

//get all interviews
exports.getInterviews = function (cb){
	interviewModel.find({}, null, {sort: {date: -1 }}, function(err, result){
        cb(err, result);
    });	
};

//get a certain interview by DNI
exports.getInterview = function (dni, cb){
	interviewModel.findOne({DNI:dni}, function(err, result){
        cb(err, result);
    });	
};

//get a certain interview by DNI
exports.deleteInterview = function (dni, cb){
	interviewModel.remove({DNI:dni}, function(err, result) {
        cb(err, result);
  	});
};

exports.getNames = function (cb){
	interviewModel.find( { }, { name:1}, function(err, result){
        cb(err, result);
    });
};