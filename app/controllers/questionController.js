// Load required packages
var questionModel = require('../models/questionModel');
var log4js = require('log4js');
var log = log4js.getLogger("questionCtrl");

exports.postQuestion = function(req, res) {

	
	var question = new questionModel({
    	wording: req.body.wording,
		level: req.body.level,
    	tech: req.body.tech,
		type: req.body.type,
		answer: JSON
  	});
	
  	question.save(function(err) {
    	if (err){
      		res.send(err);
    	}
    	else{
       		res.json({ message: 'New question created!', data: question }); 
    	}
  	});
};

exports.getProducts = function(req, res) {
	log.debug("Execute ALL getquestions! ");
	
	questionModel.find({ }, function(err, questions) {
    	if (err){
      		res.send(err);
		}
		else{
       		res.json(questions); 
    	}
	});
};