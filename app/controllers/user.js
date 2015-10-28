// Load required packages
var User = require('../models/user');
var log4js = require('log4js');
var log = log4js.getLogger("userCtrl");

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  log.debug("postUsers with Content-Type: "+req.get('Content-Type'));
  //var isJson=req.is('application/json');
   //log.debug("Is JSON: "+isJson);
  var user = new User({
    username: req.body.username,
    password: req.body.password,
    admin: req.body.admin 
  });

  user.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'New user created!', data: user });
  });
};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
  console.log("getUsers with Permision Admin!");
  User.find(function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
};