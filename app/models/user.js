// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("server");

// Define our user schema
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role:{
      type: String,
      required:true
  } 
});


UserSchema.pre('save', function(callback) {
  var user = this;
  console.log("Execute before each user.save() ");

  // Break out if the password hasn't changed
  //if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});


UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


/*UserSchema.static("getUser", function(username, callBack){
    this.findOne({username: username},function(err, user) {
        if (err){
            //Tratamiento de excepciones de consulta a la base de datos.
            //Imprimimos un mensaje de error en el log y delegamos la excepción para que lo trate quien lo llame.
         log.debug("Error at getting the user which username is "+username+" from data base: "+err);   
        }
        callBack(err, user);
  });
});*/
// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);