// Load required packages
var questionModel = require('../models/questionModel');
var log4js = require('log4js');
var log = log4js.getLogger("questionCtrl");


// POST api/question
exports.postQuestion = function(req, res) {

	
	var question = new questionModel({
    	wording: req.body.wording,
		level: req.body.level,
    	tags: req.body.tags,
		type: req.body.type,
		answer: req.body.answers
  	});
    
    if(null!=question.tags && undefined!= question.tags && 0<question.tags.length){
        question.save(function(err) {
            log.debug("answer");
            log.debug(question.answers);

            if (err){
                res.status(400).send(err);
            }
            else{
                res.json({ message: 'New question created!', data: question }); 
            }
        });   
    }
    else{
        res.status(400).json({message:"ERROR: field 'tags' must not empty"});
    }
};

// GET  api/question/:questionID
exports.getQuestion = function(req, res) {
	questionModel.getQuestion(req.params.question_id,function(err, question){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json(question); 
        }
    });
};

// GET  api/question
exports.getQuestions = function(req, res) {
	questionModel.getQuestions(function(err, result){
        if(err){
            res.status(400).sen(err);
        }
        else{
            res.json(result); 
        }
    });
};

