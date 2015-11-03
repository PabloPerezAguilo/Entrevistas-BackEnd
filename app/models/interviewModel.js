// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

var InterviewSchema = new mongoose.Schema({
    //TO DO: tendrá un conjunto de preguntas y un entrevistado
    //TO DO: el acceso a las base de datos para su gestión debe estar aquí
});

module.exports = mongoose.model('Interview', UserSchema);
