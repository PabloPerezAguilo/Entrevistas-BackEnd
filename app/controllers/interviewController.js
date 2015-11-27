// Load required packages
var Interview = require('../models/interviewModel');
var LeveledTag = require('../models/leveledTagsModel');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");

// POST api/interview
//auxiliar function. Validates the fields of the leveledTags and inserts them into the array that will set the field leveledTags of the Interview
tagsValidate =function(req, callback){
   
	var conjunto =[LeveledTag.leveledTags];
	if(null!==req.body.leveledTags && undefined!==req.body.leveledTags && 0<req.body.leveledTags.length){
         log.debug("****************************************DENTRO!!!");
        var max;
        var min;
		for(var i = 0; i < req.body.leveledTags.length; i++) {
            log.debug('-----------------------------Validando tags ------------------------------------');
            max=req.body.leveledTags[i].max;
            min=req.body.leveledTags[i].min;
			if((typeof min)=="number" && (typeof max)=="number" && max>min){
				conjunto[i]=(new LeveledTag({max: max, min: min, tag:req.body.leveledTags[i].tag}));
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


exports.postInterview = function(req, res){
    
    tagsValidate(req, function(err, tags){
        if(err){
            log.debug("****************************************ODIN!!!");
            res.status(400).send(err);
        }
        else{
            log.debug("****************************************ELSE!!!");
            interview=new Interview({
                DNI:req.body.DNI,
                name: req.body.name,
                surname: req.body.surname,
                //date: req.body.date,
                status: "PENDING",
                leveledTags: tags
            });
        }
    });
    
    
    
    
    interview.save(function(err) {
        log.debug(err);
        if (err){
             log.debug("**************************************** WOLOLO!!!");
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
                    log.error(err);
                    console.log();
                    if(-1!==err.err.indexOf("duplicate key error")){
                        err =new Error();
                        err.name="MongoError";
                        err.message="The interview "+interview.DNI+ " already exists";
                    }
                    res.status(400);
                    break;
                }
                default:{
                    //log.error(err);
                    res.status(500);
                    break;
                }
            }
            res.send(err);
        }
        else{
            log.debug("Node es un bastardo");
           res.json({ message: 'New interview created!', data: interview }); 
        }
    });
};

// GET api/interview/:DNI
// returns the interview (unique) for the candidate for the searched DNI
exports.getInterview = function(req, res){
    var dni=req.params.DNI;
    var pattern = new RegExp("^([0-9, a-z]{6,30})$", "gi");
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