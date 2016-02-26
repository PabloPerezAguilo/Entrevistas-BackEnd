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
exports.getInterviews = function (estado, res, page, cb){
	var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find({status: estado})
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(res, err, result);
        });
};

exports.getInterviewsByName = function (estado, res, page, nombre, cb){
    var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find({name:nombre, status:estado})
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(res, err, result);
        });
};

exports.getInterviewsByDateAndName = function (estado, res, page, datemin, datemax, nombre, cb){    
    var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find({date: {$gte: datemin, $lt: datemax}, name:nombre, status:estado})
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(res, err, result);
        });
    
};

exports.getInterviewsByDate = function (estado, res, page, datemin, datemax, cb){
    var options = {
	   start : (page - 1) * config.paginacion,
	   count : config.paginacion
    };
    
	interviewModel
        .find({date: {$gte: datemin,$lt: datemax}, status:estado})
        .sort({date: 1})
        .page(options, function(err, result) {
                cb(res, err, result);
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

exports.getNamesByDate = function (estado, res, datemin, datemax,cb){
	interviewModel.distinct("name", { date: { $gte: datemin, $lt: datemax} , status:estado }, function(err, result){
        cb(res, err, result);
    });
};

exports.getNames = function (estado, res, cb){
	interviewModel.distinct("name", {status:estado },function(err, result){
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

exports.postValoracion = function (id, evaluacion, cb){
	interviewModel.update({ _id: id }, { $set: { valoracion: evaluacion } }, function(err, result){
        cb(err, result);
    });
};