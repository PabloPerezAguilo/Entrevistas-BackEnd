var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var log = log4js.getLogger("daoTag");

var tagModel = require('../models/tagModel');

exports.postTag = function (tag,cb){
	tag.save(function(err) {
        cb(err);
  	});	
};

exports.getTags = function (cb){
	tagModel.find({ },function(err, datos) {
        cb(err,datos);
  	});	
};

exports.deleteTag = function (id, cb){
	tagModel.remove({tag:tag}, function(err, result) {
        cb(err, result);
  	});
};