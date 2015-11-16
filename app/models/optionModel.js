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
        type: Boolean,
        default: false
    }
});

OptionSchema.path('title').validate(function (value) {
    log.debug("Schema path validation: "+null!=value);
    return null!=value;
}, 'Invalid color');

module.exports = mongoose.model('Option', OptionSchema);

/*OptionSchema.path('title').validate(function (value) {
    log.debug("Schema path validation: "+null!=value);
    return null!=value;
}, 'Invalid color');*/