// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var log4js = require('log4js');
var ldapAuth = require('ldapauth-fork');
var config = require('../../app/config/config');

//Common utils for all Schemas and their statics and methods
var log=log4js.getLogger("userModel");

// Define our user schema
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    cn: {
        type: String
    },
    role:{    
        type: String,
        required:true
    }
});


UserSchema.pre('save', function(callback) {
  var user = this;
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
    var options = {
        url: config.ldap,
        searchBase: "ou=People,o=gfi-info.com",
        searchFilter: "(uid={{username}})"
    };
    
    try{
        var auth = new ldapAuth(options);
        auth.authenticate(this.username, password, function(err, user) {
            if (err){
                log.debug("LDAP auth error: %s", err);
                cb(err)
            }else{
                cb(null, user);
            }

            auth.close(function(err) {
                if (err){
                    console.log(err);
                }
            })
            
        });
    }catch(err){
        log.debug("Error de conexion con ldap " + err);
    }
};

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);