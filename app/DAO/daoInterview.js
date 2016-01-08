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

exports.pepe = function (cb){
	interviewModel.find({}, null, {sort: {date: 1}}, function(err, result){
        cb(err, result);
    });	
};

//get all interviews
exports.getInterviews = function (cb){
	interviewModel.find({}, null, {sort: {date: 1}}, function(err, result){
        cb(err, result);
    });	
};

exports.getInterviewsByDateAndName = function (datemin, datemax, nombre, cb){
	interviewModel.find({date: {$gte: datemin,$lt: datemax}, name:nombre}, null, {sort: {date: 1}}, function(err, result){
        cb(err, result);
    });	
};

exports.getInterviewsByDate = function (datemin, datemax, cb){
	interviewModel.find({date: {$gte: datemin,$lt: datemax}}, null, {sort: {date: 1}}, function(err, result){
        cb(err, result);
    });	
};

//get a certain interview by name
exports.getInterview = function (fullName, cb){
	interviewModel.find({name:fullName}, function(err, result){
        cb(err, result);
    });	
};

exports.getInterviewById = function (id, cb){
	interviewModel.find({_id:id}, function(err, result){
        cb(err, result);
    });	
};

//get a certain interview by DNI
exports.deleteInterview = function (id, cb){
	interviewModel.remove({_id:id}, function(err, result) {
        cb(err, result);
  	});
};

exports.getNamesByDate = function (res, datemin, datemax,cb){
	interviewModel.distinct("name", {date: {$gte: datemin,$lt: datemax}}, function(err, result){
        cb(res, err, result);
    });
};

exports.getNames = function (res, cb){
	interviewModel.distinct("name", function(err, result){
        cb(res, err, result);
    });
};