// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var log4js = require('log4js');
var cors = require('cors');
var mongoMiddleware = require('mongoose-middleware')
var config = require('./app/config/config'); // get our config file
//var redis = require("redis");
  

// =================================================================
// configuration ===================================================
// =================================================================

//configure log4js
log4js.configure("./app/config/log4js.json");
var log = log4js.getLogger("server");

var port = process.env.PORT || 9600;

// configuration  mongo=============================================
mongoMiddleware.initialize({ maxDocs : config.paginacion }, mongoose);

mongoose.connect(config.database,  function(err, res) {
    if(err) {
        log.error("Unable to connect to the data base.\nConsults and changes to data base will not work.\nOnly consults to cache (if it is enabled) are allowed " + err);
    }
    else{
        log.info("Connected to Database" + res);
    }
});

mongoose.connection.on("error", function(error) {
  // Do something sane with error here    
    log.error("Unable to connect to the data base.\nConsults and changes to data base will not work.\nOnly consults to cache (if it is enabled) are allowed");
    mongoose.connect(config.database, function(err, res) {
    
        if(!err){
            log.info("Connected to Database");
        }
    });
});

// Create our Express application
var app = express();

// Pone como defecto origin="*" y methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
app.use(cors());

// used to create, sign, and verify tokens
app.set("superSecret", config.secret); // secret variable
// use body parser so we can get info from POST data and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));// for parsing application/x-www-form-urlencoded
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));


// =================================================================
// routes ==========================================================
// =================================================================

// basic route (http://localhost:9600)
app.get("/", function(req, res) {
	res.send("Hello! The API is at http://localhost:" + port + "/api");
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();
var routes = require("./routes")(apiRoutes,app);
 //Register all our routes with /api
app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port,function(err, res) {
  if(err) throw err;
  log.info('Start Server!');
});

exports.apli = app; // needed to start de server from the tests index.js