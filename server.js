// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var log4js = require('log4js');
var config = require('./app/config/config'); // get our config file
//var redis = require("redis");
    

// =================================================================
// configuration ===================================================
// =================================================================

//configure log4js
log4js.configure('./app/config/log4js.json');
var log = log4js.getLogger("server");
//redis start
//var client = redis.createClient(); 
//handle redis error
/*client.on("error", function (err) {
    log.error("Error " + err);
});*/

var port = process.env.PORT || 9600; 

// configuration ===============================================================
mongoose.connect(config.database, function(err, res) {
  if(err) throw err;
  log.info('Connected to Database');
});


// Create our Express application
var app = express();
// used to create, sign, and verify tokens
app.set('superSecret', config.secret); // secret variable
// use body parser so we can get info from POST data and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
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
// Start the server
app.listen(port,function(err, res) {
  if(err) throw err;
  log.info('Start Server!');
});
