// Load required packages
var OptionsSchema = require('../models/optionModel');
var Question = require('../models/questionModel');
var log4js = require('log4js');
var log = log4js.getLogger("questionCtrl");

exports.postQuestion = function(req, res) {

	
	var question = new Question({
    	wording: req.body.wording,
		level: req.body.level,
    	tech: req.body.tech,
		type: req.body.type,
		answer: req.body.aswer
  	});
	
	
	
  	question.save(function(err) {
		log.debug("answer");
		log.debug(question.answer);
		
    	if (err){
      		res.send(err);
    	}
    	else{
       		res.json({ message: 'New question created!', data: question }); 
    	}
  	});
};

exports.getQuestion = function(req, res) {
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