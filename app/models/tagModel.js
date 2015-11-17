// Load required packages
var mongoose = require('mongoose');
var log4js = require('log4js');
//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

var TagSchema = new mongoose.Schema({
    tag :{
        type: String,
        required: true,
        unique: true
    }
});

TagSchema.path('tag').validate(function(value){
    var result = null!==value && 0<value.length;
}, "tag must not be empty");

module.exports = mongoose.model('Tag', TagSchema);