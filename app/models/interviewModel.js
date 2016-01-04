// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var leveledTagsModel = require("../models/leveledTagsModel");
var log=log4js.getLogger("InterviewModel");

var InterviewSchema = new mongoose.Schema({
    DNI: {
        type: String,
        //required: true,
		//unique: true
    },
	name: {
		type: String,
		required: true
	},
	/*surname:{
		type: String,
		required: true
	},*/
	date: {
		type: Date,
		default: Date.now 
	},
	status:{
        type: String,
        required: true
    },
    questions:[String],
	leveledTags:[leveledTagsModel.leveledTags]	
});

//--------------------------------------- Validators -----------------------------------------------------
InterviewSchema.path('leveledTags').validate(function(value){
    var result= undefined!==value && null!==value && 0<value.length;
    return result;
}, "Invalid leveled tags(s) input");

/*InterviewSchema.path('DNI').validate(function(value){
    var pattern = new RegExp("^([0-9,a-z]{6,30})$", "gi");
    return pattern.test(value);
}, "Invalid DNI format");*/

/*InterviewSchema.on('index', function(err){
    log.debug("WIIII"+err);
});*/

module.exports = mongoose.model('Interview', InterviewSchema);