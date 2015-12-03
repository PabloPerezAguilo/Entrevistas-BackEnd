// Load required packages
var Interview = require('../models/interviewModel');
var LeveledTag = require('../models/leveledTagsModel');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");
var validator = require('../utils/validator'); 

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
                date: req.body.date,
                status: "PENDING",
                leveledTags: tags
            });
        }
    });
	
    interview.save(function(err) {
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
        Interview.getInterview(dni, function(err, result){
            if(err){
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
        Interview.getInterviews(function(err, interviews){
          if(err){
              res.status(400).send(err);
          }
          else{
              res.json(interviews);
          }
        });
};

// DELETE  api/interview/:DNI
exports.deleteInterview = function(req, res) {
    var id=req.params.DNI;
	Interview.deleteInterview(id,function(err, result){
        if(err){
            res.status(400).send(err);
        }
        else{
            var response;
            if(0<result){
                response={success:true , message:"Interview with DNI "+id +" deleted"};
                
            }
            else{
                response={success:false , message:"No interview with DNI "+id +" found"};
                res.status(400);
            }
            res.json(response); 
        }
    });
};