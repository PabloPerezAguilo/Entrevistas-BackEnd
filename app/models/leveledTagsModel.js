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
        type: Number
    },
	min: {
        required: true,
        type: Number
    }
});

module.exports = ('leveledTags', leveledTagsSchema);