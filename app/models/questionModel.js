// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

// Define our user schema
var QuestionSchema = new mongoose.Schema({
    
    wording: {
        type: String,
        required: true
    },
    type: {
        
    }
  
});


// Export the Mongoose model
module.exports = mongoose.model('Question', QuestionSchema);