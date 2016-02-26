// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var leveledTagsModel = require("../models/leveledTagsModel");
var log=log4js.getLogger("InterviewModel");

var InterviewSchema = new mongoose.Schema({
    DNI: {
        type: String,

    },
	name: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now 
	},
	status:{
        type: String,
        required: true
    },
    questions:[String],
    feedback: String,
    answers:[],
    nquestions:[],
	leveledTags:[leveledTagsModel.leveledTags],
    valoracion:[]
});

//--------------------------------------- Validators -----------------------------------------------------
InterviewSchema.path('leveledTags').validate(function(value){
    var result= undefined!==value && null!==value && 0<value.length;
    return result;
}, "Invalid leveled tags(s) input");

module.exports = mongoose.model('Interview', InterviewSchema);