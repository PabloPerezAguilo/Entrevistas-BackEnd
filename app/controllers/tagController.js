var tagModel = require('../models/tagModel');
var log4js = require('log4js');
var log = log4js.getLogger("tagCtrl");

exports.postTag = function(req, res){
    var tag = new tagModel({
        tag: req.body.tag
    });
    
    tag.save(function(err){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json({success: true, tag: tag.tag});
        }
    });
};

exports.getTags = function(req, res) {
	tagModel.getTags(function(err, result){
        if(err){
            res.status(500).send(err);
        }
        else{
            res.json(result); 
        }
    });
};