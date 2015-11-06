// Load required packages
var Interview = require('../models/interviewModel');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");

exports.postInterview = function(req, res){
    //Testing code to know if the ADMIN_ROLE is able to use this method
    log.debug("posting Interview");
    res.status(200).json({ message: 'posting Interview!'});
};

// api/interview/:DNI
// returns the interview (unique) for the candidate for the searched DNI
exports.getInterview = function(req, res){
    var dni=req.params.DNI;
    if(null!=dni && undefined!= dni && (dni.length===9 ||dni.length===10)){
        Interview.getInterview(dni, function(err, result){
            if(err){
                res.status(400).send(err);
            }
            else{
                res.jason(result);
            }
        });
    }
    else{
        res.status(400).json({ message: 'ERROR: Invalid DNI format: '+dni});
    }
};

exports.getInterviews = function(req, res){
    //Testing code to know if the ADMIN_ROLE is able to use this method
    log.debug("getting all interviews");
    res.status(200).json({ message: 'getting all interviews!'});
};


exports.putInterview = function(req, res){
    //Testing code to know if the ADMIN_ROLE is able to use this method
    log.debug("updating the Interview");
    res.status(200).json({ message: 'updating the Interview!'});
};

exports.deleteInterview = function(req, res){
    //Testing code to know if the ADMIN_ROLE is able to use this method
    log.debug("deleting the Interview");
    res.status(200).json({ message: 'deleting the Interview!'});
};