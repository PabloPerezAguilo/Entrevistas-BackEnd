var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var log = log4js.getLogger("daoQuestion");

var questionModel = require('../models/questionModel');

exports.postQuestion = function (question,cb){
	question.save(function(err) {
        cb(err);
  	});	
};

exports.getQuestions = function (cb){
	questionModel.find({ },function(err, datos) {
        cb(err, datos);
  	});	
};

//get a certain question
exports.getQuestion = function (question,cb){
	questionModel.findOne({_id:question}, function(err, result){
        cb(err, result);
    });
};

//get all questions for a certain technology
exports.getQuestionByTag = function (etiqueta,cb){
	questionModel.find({tags:{ $all: etiqueta }}, function(err, result){
        cb(err, result);
    });
};

exports.getQuestionsByLevelRange = function (tag , minLevel, maxLevel, cb){
	questionModel.find({tags: tag, level: {$gte: minLevel, $lte: maxLevel}},{_id:1}, function(err, result){
        
        cb(err, result , tag);
    });
};

exports.deleteQuestion = function (question, cb){
	questionModel.remove({_id:question}, function(err, result) {
        cb(err, result);
  	});
};

exports.putQuestion = function (question, req, cb){
	questionModel.update({_id:question}, {title: req.body.title, level: req.body.level, tech: req.body.tech, 
								 type: req.body.type, answers: req.body.answers}, function(err, result) {
		cb(err, result);
  	});
};