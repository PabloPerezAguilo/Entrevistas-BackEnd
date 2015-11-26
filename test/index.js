/*var boot = require('../server').boot;
var  shutdown = require('../server').shutdown;
var  port = require('../server').port;*/
var tagModel = require('../app/models/tagModel');
var  superagent = require('superagent'); //cliente http
var  expect = require('chai').expect; //sintaxis alternativa para las pruebas
var log4js = require('log4js');
var log = log4js.getLogger("test");

var http = require ("http");
var app = require ("../server").apli;
var server = http.createServer(app);

var boot = function () {
	server.listen(app.get('port'), function(){
		console.info('Express server listening on port ' + app.get('port'));
	});
}

var shutdown = function() {
	server.close();
}

if (require.main === module) {
	boot();
}else {
	console.info('Running app as a module')
	exports.boot = boot;
	exports.shutdown = shutdown;
	exports.port = app.get('port');
}


describe('server', function () {
  	before(function () {
		boot();
  	});
	
	describe('homepage', function(){
		it('should respond to GET',function(done){
			superagent
			.get('localhost:9600/api/interview')
			.end(function(err,res){
				expect(res.status).to.equal(200);
				done()
			})
		})
	});
	
	describe('Insercion tag', function(){
		it('insertar un tag',function(done){
			var objeto = new tagModel({
        		tag: "hola"
    		});
			
			superagent
			.get('localhost:9600/api/interview')
			.send(objeto)
			.end(function(err,res){
				expect(res.status).to.equal(200);
				done()
			})
		})
	});
	
	after(function () {
  		shutdown();
	});
});