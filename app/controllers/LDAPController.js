var log4js = require('log4js');
var log = log4js.getLogger("LDAPCtrl");
var ldapAuth = require('ldapauth-fork');
var config = require('../../app/config/config');

function findUsers (ldap, callback) {

    var self = ldap;
    var searchFilter = self.opts.searchFilter;
    var opts = {filter: searchFilter, scope: self.opts.searchScope};
    
    if (self.opts.searchAttributes) {
        opts.attributes = self.opts.searchAttributes;
    }

    self._search(self.opts.searchBase, opts, function (err, result) {
        if (err) {
          self.log && self.log.trace('ldap authenticate: user search error: %s %s %s', err.code, err.name, err.message);
          return callback(err);
        }
        return callback(null, result)
    });
};

exports.LDAP = function(req, res) {
    var usr = req.body.usr;
    var pass = req.body.pass;
    
    var options = {
        url: config.ldap,
        searchBase: "ou=People,o=gfi-info.com",
        searchFilter: "(uid={{username}})"
    };

    try{
        var auth = new ldapAuth(options);
        auth.authenticate(usr, pass, function(err, user) {
            if (err){
                log.debug("LDAP auth error: %s", err);
                res.send(err);
            }else{
                res.send(user);
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
}

exports.ldapUsers = function(req, res) {
    
    var options = {
        url: config.ldap,
        searchBase: "ou=People,o=gfi-info.com",
        searchFilter: "(&(uid=*))",
        searchAttributes: ["uid", "cn"]
    };
    
    try{
        var auth = new ldapAuth(options);
       
        findUsers(auth, function(err, user) {
            if (err){
                log.debug("LDAP auth error: %s", err);
                res.send(err);
            }else{
                res.send(user);
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
}