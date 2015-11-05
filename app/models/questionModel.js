// Load required packages
var optinModel = require("../models/optionModel");
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var config = require('../config/config');
//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

var QuestionSchema = new mongoose.Schema({
    
    wording: {
        type: String,
        required: true,
        unique:true
    },
    type: {
        required:true,
        type: String,
    },
    tech:{
        type: String,
        required: true
    },
    level:{
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    answer:[optinModel.Option]
});

//------------------STATIC METHODS (for acces to the data base)------------------------------------------

//get all questions
QuestionSchema.static("getQuestions", function(cb){
    
    this.find(function(err, result){
       if(err){
           //Tratamiento de excepciones de consulta a la base de datos.
            //Imprimimos un mensaje de error en el log y delegamos la excepción para que lo trate quien lo llame.
         log.debug("Error at getting all questions: "+err);
       }
        cb(err, result);
    });
});

//get all questions for a certain technology
QuestionSchema.static("getQuestionsByTech", function(tech, cb){
    
    this.find({tech: tech},function(err, result){
       if(err){
           //Tratamiento de excepciones de consulta a la base de datos.
            //Imprimimos un mensaje de error en el log y delegamos la excepción para que lo trate quien lo llame.
         log.debug("Error at getting the questions for the technology "+tech+": "+err);
       }
        cb(err, result);
    });
});

//get a certain question
QuestionSchema.static("getQuestion", function(question, cb){
    //Por el momento se busca por el id de la pregunta. Se puede adaptar a buscar por el enunciado
    this.findOne({_id:question}, function(err, result){
        if(err){
           log.debug("Error at getting the question which ID is "+question+": "+err);
        }
        cb(err, result);
    });
});

//get all questions which level is in the range defined
QuestionSchema.static(" ", function (minLevel, maxLevel, cb){
    this.find({level: {$gte: minLevel, $lte: maxLevel}}, function(err, result){
        if(err){
            log.debug("Error at getting the question which level is in ["+minLevel+" , "+maxLevel+"]: "+err);
        }
        cb(err, result);
    });
});

//------------------------------------Mongoose methods----------------------------------------------------

QuestionSchema.pre('save', function(cb){
    console.log("Execute before each question.save() ");
    if("SINGLE_CHOICE"!=this.type && 
       "MULTI_CHOICE"!=this.type && 
       "FREE"!=this.type){
        //ERROR. Las preguntas deben ser de uno de los 3 tipos
    }
    else{
        //Seguimos con las comprobaciones
        if("FREE"===this.type){
            //Vaciamos las opciones o damos error si las tiene. Depende de la política de tratamiento de errores
        }
        else{
            if(0<this.answer.length){
                if("SINGLE_CHOICE"===this.type){
                    //Comprobamos que haya exactamente una opción correcta
                }

                if("MULTI_CHOICE"===this.type){
                    //Comprobamos que haya al menos una opción correcta
                }
            }
            else{
                //ERROR. La pregunta debe tener por lo menos una opción
            }
            
        }
        
    }
    
});

// Export the Mongoose model
module.exports = mongoose.model('Question', QuestionSchema);