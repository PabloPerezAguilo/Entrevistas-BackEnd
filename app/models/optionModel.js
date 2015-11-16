var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var SchemaObject = require('node-schema-object');

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

var OptionSchema =  new SchemaObject({
    title: {
        type: String,
        required: true
    },
    valid: {
        required: true,
        type: Boolean,
        default: false
    }
});



module.exports = mongoose.model('Option', OptionSchema);


