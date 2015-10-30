var productController = require('./app/controllers/product');
var userController = require('./app/controllers/user');
var authRole = require('./app/controllers/authRole');

var log4js = require('log4js');
var log = log4js.getLogger("routes");

module.exports = function(router,app,client) {
log.debug("Load routers!");

var router = require("./app/routes/publicRoutes")(router,app);
var router = require("./app/routes/routesAuth")(router,app);
var router = require("./app/routes/privateRoutes")(router);
	 
/*var router = require("./app/routes/routes-auth")(router,app);
var router = require("./app/routes/product")(router,client);*/
return router;
};