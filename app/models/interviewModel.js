// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var leveledTagsModel = require("../models/leveledTagsModel");

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
	status:{
        type: String,
        required: true
    },
	leveledTags:[leveledTagsModel.leveledTags]	
});

//--------------------------------------- Validators -----------------------------------------------------
InterviewSchema.path('leveledTags').validate(function(value){
    var result= undefined!==value && null!==value && 0<value.length;
    return result;
}, "Invalid leveled tags(s) input");

InterviewSchema.path('DNI').validate(function(value){
    log.debug(typeof value);
    var pattern = new RegExp("^([0-9,a-z]{6,30})$", "gi");
    return pattern.test(value);
}, "Invalid DNI format");

/*InterviewSchema.on('index', function(err){
    log.debug("WIIII"+err);
});*/

//-------------------------------- Statics and methods----------------------------------------------------------

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
           log.debug("Error at getting the interview which DNI is " + dni + ": "+err);

        }
        cb(err, result);
    });
});

InterviewSchema.static("deleteInterview", function(dni, cb){
	
	this.remove({DNI:dni}, function(err, result) {
		//borrar los tags si no quedan mas preguntas con ese tag
    	if (err){
			log.debug("Error deleting the interview which DNI is " + dni + ": " + err);
        }
        cb(err, result);
  	});
});

module.exports = mongoose.model('Interview', InterviewSchema);