// Load required packages
var Interview = require('../models/interviewModel');
var LeveledTag = require('../models/leveledTagsModel');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");
var validator = require('../utils/validator');
var daoInterview = require("../DAO/daoInterview");
var daoQuestion = require("../DAO/daoQuestion");

function strExists(str){
    return undefined!==str && null!==str && 0<str.length;
}

function tagsValidate (req, callback){
	var conjunto =[LeveledTag.leveledTags];
	if(validator.notEmptyArray(req.body.leveledTags)){
        var max;
        var min;
        var tag;
		for(var i = 0; i < req.body.leveledTags.length; i++) {
            tag=req.body.leveledTags[i].tag;
            max=req.body.leveledTags[i].max;
            min=req.body.leveledTags[i].min;
			
			if((typeof min)=="number" && (typeof max)=="number" && max>=min &&
                    validator.valueInRange(min, 1, 10) && validator.valueInRange(max, 1, 10) &&
                    strExists(tag) && validator.strValidator(tag, 50)){
				conjunto[i]=(new LeveledTag({max: max, min: min, tag:tag}));           
			}else{
				var error=new Error();
                error.name="ValidationError";
                if((typeof min)!="number" || (typeof max)!="number"){
                    error.message="The min and max values must be numbers"   
                }
                if(max<min){
                    error.message = "The min value must be lower or equal to the max one";
                }
                if(validator.valueInRange(min, 1, 10) || validator.valueInRange(max, 1, 10)){
                    error.message= "The min and max values must be in the interval [1,10]";
                }
                if(!strExists(tag)){
                    error.message= "The field tag must not be empty";
                }
                if(!validator.strValidator(tag, 50)){
                    error.message="Thge tag is longer than it should"
                }
				
				callback(error);
			}
		}
	}else{
		conjunto=undefined;
	}
	callback(error,conjunto);
};

// POST api/interview
//auxiliar function. Validates the fields of the leveledTags and inserts them into the array that will set the field leveledTags of the Interview

exports.postInterview = function(req, res){
	tagsValidate(req, function(err, tags){
        if(err){
            log.debug(err);
			res.status(400).send(err);
        }
        else{
            interview=new Interview({
                DNI:req.body.DNI,
                name: req.body.name,
                surname: req.body.surname,
                date: req.body.date,//"2020-12-20T22:22",
                status: "PENDING",
                leveledTags: tags
            });
            //interview.questions="FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU";
        }
    });
	
    var i = 0;
    var seguir = true;
    
   /* while ( i < interview.leveledTags.length && seguir==true) {
        seguir=false;
        i++;
        daoQuestion.getQuestionsByLevelRange(interview.leveledTags[i].tag,
                    interview.leveledTags[i].min, interview.leveledTags[i].max, function(err, result, tag){
            
            log.debug("Preguntas para " + tag + " " + result);
            //si es el ultimo ejecutar el post
            if(result!==null && result.length!=0 && result!==undefined ){
                
                interview.questions = interview.questions.concat(result);
            }
            
            log.debug("QUESTIONS " + interview.questions + "LONGITUD " + interview.questions.length);
            seguir=true;
        });
    }*/
    
    //añadir preguntas con esos niveles
    for(var i = 0; i < interview.leveledTags.length; i++) {
        
        daoQuestion.getQuestionsByLevelRange(interview.leveledTags[i].tag,
                    interview.leveledTags[i].min, interview.leveledTags[i].max, function(err, result, tag){
            
            log.debug("Preguntas para " + tag + " " + result);
            //si es el ultimo ejecutar el post
            if(result!==null && result.length!=0 && result!==undefined ){
                
                interview.questions = interview.questions.concat(result);
            }
            
            log.debug("QUESTIONS " + interview.questions + "LONGITUD " + interview.questions.length);
        });
    }
    
    daoInterview.postInterview(interview,function(err) {
        log.debug(err);
        if (err){
            switch(err.name){
                case "ValidationError":{
                    var validationErrors=[];
                    for(value in err.errors){
                        validationErrors.push(err.errors[value].message);
                    }
                    err=new Error();
                    err.name='ValidationError';
                    err.message=validationErrors;
                    res.status(400);
                    break;
                }
                case 'MongoError':{
                    if(-1!==err.err.indexOf("duplicate key error")){
                        err =new Error();
                        err.name="MongoError";
                        err.message="The interview "+interview.DNI+ " already exists";
                    }
                    res.status(400);
                    break;
                }
                default:{
                    res.status(500);
                    break;
                }
            }
            res.send(err);
        }
        else{
           res.json({ message: 'New interview created!', data: interview }); 
        }
    });
};

// GET api/interview/:DNI
// returns the interview (unique) for the candidate for the searched DNI
exports.getInterview = function(req, res){
    var dni=req.params.DNI;
    var pattern = new RegExp("^([0-9,a-z]{6,30})$", "gi");
    if(pattern.test(dni)){
        daoInterview.getInterview(dni, function(err, result){
            if(err){
                log.debug("Error at getting the interview which DNI is " + dni + ": "+err);
                res.status(500).json({success:false,message: err.message});
            }
            else{
                if(null!=result && undefined!=result){
                    res.json(result);
                }
                else{
                    res.status(400).json({success:false,
                                          message: "No interview found with the DNI "+dni});
                }
            }
        });
    }
    else{
        res.status(400).json({ message: 'ERROR: Invalid DNI format: '+dni});
    }
};

exports.getInterviews = function(req, res) {
    daoInterview.getInterviews(function(err, interviews){
        if(err){
            log.debug("Error at getting all interviews: "+err);
        }
        else{
            res.json(interviews);
        }
    });
};

// DELETE  api/interview/:DNI
exports.deleteInterview = function(req, res) {
    var id=req.params.DNI;
    
	daoInterview.deleteInterview(id,function(err, result){
        if(err){
			log.debug("Error deleting the interview which DNI is " + dni + ": " + err);
            res.status(400).send(err);
        }
        else{
            var response;
            if(0<result){
                response={success:true , message:"Interview with DNI " + id +" deleted"};
                
            }
            else{
                response={success:false , message:"No interview with DNI " + id +" found"};
                res.status(400);
            }
            res.json(response); 
        }
    });
};