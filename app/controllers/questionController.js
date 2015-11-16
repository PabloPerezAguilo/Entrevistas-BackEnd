// Load required packages
var questionModel = require('../models/questionModel');
var Option = require('../models/optionModel');
var log4js = require('log4js');
var log = log4js.getLogger("questionCtrl");


// POST api/question
exports.postQuestion = function(req, res) {

	//log.debug(req.body);
	var question = new questionModel({
    	title: req.body.title,
		level: req.body.level,
    	tags: req.body.tags,
		type: req.body.type,
        directive:req.body.directive,
		answers: req.body.answers
  	});
    
    
    log.debug("*****************************************************************************");
    log.debug(Boolean== typeof true);
    if(null!==question.answers && undefined!==question.answers && 0<question.answers.length){
        var aux;
        
        for(var i=0;i<question.answers.length;i++){
            log.debug("TIPO: "+question.answers[i]);
            aux=new Option({valid: question.answers[i].valid, title:question.answers[i].title});
            log.debug(aux);
        }
    }
    log.debug("----------------------------------PRE-------------------------------");

        question.save(function(err) {
            if (err){
                log.error(err.stack)
                res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            else{
                res.json({ message: 'New question created!', data: question }); 
            }
        });   
};

// GET  api/question/:questionID
exports.getQuestion = function(req, res) {
    var id=req.params.question_id;
	questionModel.getQuestion(id,function(err, question){
        if(err){
            res.status(500).send(err);
        }
        else{
            if(null===question){
                res.status(400).json({success: false, message: "No question found with the ID "+id});
            }
            else{
                res.json(question); 

            }
        }
    });
};

// GET  api/question
exports.getQuestions = function(req, res) {
	questionModel.getQuestions(function(err, result){
        if(err){
            res.status(500).send(err);
        }
        else{
            res.json(result); 
        }
    });
};

// DELETE  api/question/:questionID
exports.deleteQuestion = function(req, res) {
    var id=req.params.question_id;
	questionModel.deleteQuestion(id,function(err, result){
        if(err){
            res.status(400).send(err);
        }
        else{
            var response;
            if(0<result){
                response={success:true , message:"Question with ID "+id +" deleted"};
                
            }
            else{
                response={success:false , message:"No Question with ID "+id +" found"};
                res.status(400);
            }
            res.json(response); 
        }
    });
};

// PUT  api/question/:questionID
exports.putQuestion = function(req, res) {
	log.debug("PUTTING "+ req.body.wording);
	questionModel.putQuestion(req.params.question_id,req,function(err, question){
		
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json(question); 
        }
    });
};
