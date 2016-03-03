// Load required packages
var optionModel = require("../models/optionModel");
var mongoose = require('mongoose');
var log4js = require('log4js');
var config = require('../config/config');
//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("questionModel");
var validator = require('../utils/validator'); 

var QuestionSchema = new mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },  
    type: {
        required:true,
        type: String,
    },
    tags: [String], 
    level:{
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    directive:{
        type:String
    },
    answers:[optionModel.option]
});

//------------------------------Validations--------------------------------------------------------------

QuestionSchema.path('type').validate(function (value) {
    var result;
    result = "SINGLE_CHOICE"===value ||  "MULTI_CHOICE"===value || "FREE"===value;    
    return result;
    
}, 'Invalid type');

QuestionSchema.path('tags').validate(function(value){
    result=true;
    if(!validator.notEmptyArray(value)){
        result=false;
    }
    return result;
}, "tags field is required and cannot be empty");

QuestionSchema.path('title').validate(function(value){
    result=true;
    if(!validator.strValidator(value, 1000)){
        result=false;
    }
    return result;
}, "Too long title");

/*QuestionSchema.path('directive').validate(function(value){
    result=true;
    if(!validator.strValidator(value, 300)){
        result=false;
    }
    return result;
}, "Too long title");*/

//------------------------------------Mongoose methods----------------------------------------------------

QuestionSchema.pre('save', function(cb){
    var err=null;
   
    //Comprobamos que el array de tags :
    //1)Exista y se haya incluido
    //2)no esté vacío
    
    //Seguimos con las comprobaciones
    if("FREE"===this.type){
        if(null!==this.answers && undefined!==this.answers){
            err=new Error("A question with type 'FREE' cannot have answers");
        }
    }
    else{
        if(null!==this.directive && undefined!==this.directive){
            err=new Error("A question with type '"+this.type+"' cannot have a directive");
        }
        else{
            if(validator.notEmptyArray(this.answers)){
                var correctAnswers=0;
                for (var i=0;i<this.answers.length;i++){
                    if(this.answers[i].valid){
                        correctAnswers++;
                    }
                }
                //Si es e tipo simple, comprobamos que haya exactamente una opción correcta. Sino, da error
                if("SINGLE_CHOICE"===this.type && 1!=correctAnswers){
                    err= new Error("A question with type 'SINGLE_CHOICE' must have exactly one valid answer");
                }
            }
            else{
                //ERROR. La pregunta debe tener por lo menos una opción
                err= new Error("The question must have at least one answer");
            }

        }

    }

    if(err){
        log.debug(err);
        cb(err);
    }
    else{
        cb();
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Question', QuestionSchema);