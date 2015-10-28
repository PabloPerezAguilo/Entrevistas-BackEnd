// Load required packages
var mongoose = require('mongoose');

// Define our Product schema
var ProductSchema   = new mongoose.Schema({
  name: { type: String, required: true},
  type: { type: String, required: true},
  quantity: Number,
  userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('Product', ProductSchema);