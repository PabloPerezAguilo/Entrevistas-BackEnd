var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SchemaObject = require('node-schema-object');


var leveledTagsSchema =  new SchemaObject({
    tag: {
        required: true,
		type: String
    },
    max: {
        required: true,
        type: Number,
        min: 1,
        max: 10
    },
	min: {
        required: true,
        type: Number,
        min: 1,
        max: 10
    }
});


module.exports = ('leveledTags', leveledTagsSchema);