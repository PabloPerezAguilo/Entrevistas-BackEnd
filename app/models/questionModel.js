// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

var OptionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    valid: {
        required: true,
        type: Boolean
    }
});



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
    options:[OptionsSchema]
});

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

QuestionSchema.static("getQuestion", function(question, cb){
    //Por el momento se busca por el id de la pregunta. Se puede adaptar a buscar por el enunciado
    this.findOne({_id:question}, function(err, result){
        if(err){
           log.debug("Error at getting the question which ID is "+question+": "+err);
        }
        cb(err, result);
    });
});

QuestionSchema.static("getQuestionsByLevelRange", function (minLevel, maxLevel, cb){
    this.find({level: {$gte: minLevel, $lte: maxLevel}}, function(err, result){
        if(err){
            log.debug("Error at getting the question which level is in ["+minLevel+" , "+maxLevel+"]: "+err);
        }
        cb(err, result);
    });
});

// Export the Mongoose model
module.exports = mongoose.model('Question', QuestionSchema);