var log4js = require('log4js');
var log = log4js.getLogger("daoInterview");
var config = require('../../app/config/config');
var interviewModel = require('../models/interviewModel');

exports.postInterview = function (interview,cb){
	interview.save(function(err) {
        cb(err);
  	});	
};

//get all interviews
exports.getInterviews = function (page, cb){
	var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find()
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(err, result);
        });
};

exports.getInterviewsPaged = function (page, cb){
    var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find()
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(err, result);
        });
};

exports.getInterviewsByDateAndName = function (page, datemin, datemax, nombre, cb){    
    var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find({date: {$gte: datemin, $lt: datemax}, name:nombre})
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(err, result);
        });
    
};

exports.getInterviewsByDate = function (page, datemin, datemax, cb){
    var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find({date: {$gte: datemin,$lt: datemax}})
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(err, result);
        });
};

//get a certain interview by name
exports.getInterview = function (id, cb){
	interviewModel.findOne({_id: id}, function(err, result){
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
	interviewModel.remove({ _id: id }, function(err, result) {
        cb(err, result);
  	});
};

exports.getNamesByDate = function (res, datemin, datemax,cb){
	interviewModel.distinct("name", { date: { $gte: datemin, $lt: datemax} }, function(err, result){
        cb(res, err, result);
    });
};

exports.getNames = function (res, cb){
	interviewModel.distinct("name", function(err, result){
        cb(res, err, result);
    });
};

exports.saveAnswers = function (id, ans, cb){
	interviewModel.update({ _id: id }, { $set: { answers: ans } }, function(err, result){
        cb(err, result);
    });
};

exports.postFeedback = function (id, anotations, cb){
	interviewModel.update({ _id: id }, { $set: { feedback: anotations } }, function(err, result){
        cb(err, result);
    });
};

exports.updateState = function (id, nuevoEstado, cb){
	interviewModel.update({ _id: id }, { $set: { status: nuevoEstado } }, function(err, result){
        cb(err, result);
    });
};