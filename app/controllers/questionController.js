// Load required packages
var questionModel = require('../models/questionModel');
var optionModel = require('../models/optionModel');
var tagModel = require('../models/tagModel');
var log4js = require('log4js');
var log = log4js.getLogger("questionCtrl");
var validator = require('../utils/validator'); 



// gets the answers from the body and puts them in the array conjunto checking if the values are corrects
rellenar = function (req, callback){
	var conjunto =[optionModel.option];
	if(validator.notEmptyArray(req.body.answers)){
		for(var i = 0; i < req.body.answers.length; i++) {
			if((typeof req.body.answers[i].valid)=="boolean" && validator.strValidator(req.body.answers[i].title, 50)){
				conjunto[i]=(new optionModel({valid: req.body.answers[i].valid, title: req.body.answers[i].title}));
			}else{
				var error=new Error();
                error.name="InvalidType";
				error.message = "The value must be boolean";
				callback(error);
			}
		}
	}else{
		conjunto=undefined;
	}
	callback(error,conjunto);
};

exports.postQuestion = function(req, res) {
	rellenar(req,function(err,respuesta){
		if (err){
			res.status(500).send(err);
		}else{
			
			var question = new questionModel({
				title: req.body.title,
				level: req.body.level,
				tags: req.body.tags,
				type: req.body.type,
                directive: req.body.directive,  
				answers: respuesta
			});
			question.save(function(err) {
				if (err){
                    log.debug(err);
					res.status(400).json({
						success: false,
						message: err.message
					});
				}
				else{
					res.json({ message: 'New question created!', data: question }); 
				}
			});  
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
	var questionTags = null;
	
	//almacena los tags de la pregunta que se va a eliminar
	questionModel.find({_id:id }, { tags:1,_id:0 }, function(err, resultado ) {
    	if (err){
			log.debug("Error " + err);
        }
		else{
			questionTags= resultado[0].tags;
		}	
  	});
	
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
			
			//busca si existen mas preguntas con esos tag, si no elimina el tag de la BD
			questionTags.forEach(function(value) {
				questionModel.find({tags: value},  function(err, result) {
					if (err){
						log.debug("Error " + err);
					}
					else{
						if(null===result || undefined===result || 0===result.length){
							tagModel.remove({tag:value}, function(err, result) {
								if (err){
									log.debug("Error deleting the tag which ID is "+value+": "+err);
								}
								else{
									log.debug("The tag "+value+" has been deleted");
								}
							});
						}
					}
				});
			});
        }
    });
};

// PUT  api/question/:questionID
exports.putQuestion = function(req, res) {
	questionModel.putQuestion(req.params.question_id,req,function(err, question){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json(question); 
        }
    });
};

exports.getQuestionByTag = function(req, res) {
    var tags=req.body.tags;
	questionModel.getQuestionByTag(tags,function(err, question){
        if(err){
            res.status(500).send(err);
        }
        else{
            if(null===question || 0==question.length || undefined===question ){
                res.status(400).json({success: false, message: "No question found with the tags: "+tags});
            }
            else{
                res.json(question); 
            }
        }
    });
};