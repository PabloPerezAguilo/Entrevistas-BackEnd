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
}, "Too long directive");*/

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
    
    this.find({tags: tech},function(err, result){
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
QuestionSchema.static("getQuestionsByLevelRange", function (minLevel, maxLevel, cb){
    this.find({level: {$gte: minLevel, $lte: maxLevel}}, function(err, result){
        if(err){
            log.debug("Error at getting the question which level is in ["+minLevel+" , "+maxLevel+"]: "+err);
        }
        cb(err, result);
    });
});


// delete question by id /api/products/:product_id
QuestionSchema.static("deleteQuestion", function(question, cb){
	this.remove({_id:question}, function(err, result) {
    	if (err){
			log.debug("Error deleting the question which ID is "+question+": "+err);
        }
        cb(err, result);
  	});
});

// put question by id /api/products/:product_id 
QuestionSchema.static("putQuestion", function(question, req, cb){
	this.update({_id:question}, {title: req.body.title, level: req.body.level, tech: req.body.tech, 
								 type: req.body.type, answers: req.body.answers}, function(err, result) {
    	if (err){
			log.debug("Error updating the question which ID is "+question+": "+err);
        }
		cb(err, result);
  	});
});

QuestionSchema.static("getQuestionByTag", function(etiqueta, cb){

	if(etiqueta!==null && etiqueta!==undefined){
		this.find({tags:{ $all: etiqueta }}, function(err, result){
				if(err){
				   log.debug("Error at getting the question which tag is "+etiqueta+": "+err);
				}
				cb(err, result);
			});
	}else{
		err= new Error();
		err.name="Tags cannot be null";
		err.message="Tags cannot be null";
		cb(err, null);
	}
});

//------------------------------------Mongoose methods----------------------------------------------------

QuestionSchema.pre('save', function(cb){
    var err=null;
   
    //Comprobamos que el array de tags :
    //1)Exista y se haya incluido
    //2)no esté vacío
    
    //Seguimos con las comprobaciones
    if("FREE"===this.type){
        //Damos error si tiene opciones.
        if (this.directive!==undefined && this.directive!==null){
            if(!validator.strValidator(this.directive, 300)){
                 err=new Error( "Too long directive");
            }
        }
       
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

                //Si es e tipo simple, comprobamos que haya al menos una opción correcta. Sino, da error
                if("MULTI_CHOICE"===this.type && 0===correctAnswers){
                    err= new Error("A question with type 'MULTI_CHOICE' must have at least one valid answer");
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