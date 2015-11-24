// Load required packages
var Interview = require('../models/interviewModel');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");

// POST api/interview
exports.postInterview = function(req, res){
    interview=new Interview({
        DNI:req.body.DNI,
		name: req.body.name,
		surname: req.body.surname,
		//date: req.body.date,
		status: req.body.status,
		leveledTags: req.body.leveledTags
    });
    
    interview.save(function(err) {
        if (err){
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