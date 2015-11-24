// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var leveledTagsModel = require("../models/resourceModel");

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

var InterviewSchema = new mongoose.Schema({
    DNI: {
        type: String,
        required: true,
		unique: true
    },
	name: {
		type: String,
		required: true
	},
	surname:{
		type: String,
		required: true
	},
	//date: Date,
	status: String,
	leveledTags:[leveledTagsModel.leveledTags]	
});


//get all interviews
InterviewSchema.static("getInterviews", function(cb){
    this.find(function(err, result){
       if(err){
         log.debug("Error at getting all interviews: "+err);
       }
        cb(err, result);
    });
});

//get a certain interview by DNI
InterviewSchema.static("getInterview", function(dni, cb){
    this.findOne({DNI:dni}, function(err, result){
        if(err){
           log.debug("Error at getting the interview which DNI is "+dni+": "+err);
        }
        cb(err, result);
    });
});

module.exports = mongoose.model('Interview', InterviewSchema);