// Load required packages
var User = require('../models/user');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");

exports.postInterview = function(req, res){
    //Testing code to know if the ADMIN_ROLE is able to use this method
    log.debug("posting Interview");
    res.status(200).json({ message: 'posting Interview!'});
};

exports.getInterview = function(req, res){
    //Testing code to know if the ADMIN_ROLE is able to use this method
    log.debug("getting the Interview ");
    res.status(200).json({ message: 'getting the Interview!'});
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