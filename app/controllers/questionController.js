// Load required packages
var questionModel = require('../models/questionModel');
var optionModel = require('../models/optionModel');
var log4js = require('log4js');
var log = log4js.getLogger("questionCtrl");


// POST api/question
rellenar = function (req, callback){
	log.debug("*/***//*/*/*/*/*/*/FUnction /*/*/*/*//*/*//*/*/*"+typeof req.body.answers[1].valid);
	var conjunto =[optionModel.option];
	
	for(var i = 0; i < req.body.answers.length; i++) {
		if((typeof req.body.answers[i].valid)=="boolean"){
			log.debug("*/***//*/*/*/*/*/*/DENTRO /*/*/*/*//*/*//*/*/*"+typeof req.body.answers[i].valid);
			conjunto[i]=(new optionModel({ valid: req.body.answers[i].valid, title: req.body.answers[i].title}));
		}else{
			var mal=new Error();
			mal.message = "No es un boolean";
			log.debug("SALIO CON ERROR");
			callback(mal);
		}
	}

	callback(mal,conjunto);
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
				answers: respuesta
			});
			question.save(function(err) {
				if (err){
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
	questionModel.putQuestion(req.params.question_id,req,function(err, question){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json(question); 
        }
    });
};
