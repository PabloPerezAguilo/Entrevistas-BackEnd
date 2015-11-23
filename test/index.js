/*var boot = require('/app').boot;
var  shutdown = require('/app').shutdown;
var  port = require('/app').port;*/
var tagModel = require('../app/models/tagModel');
var  superagent = require('superagent'); //cliente http
var  expect = require('chai').expect; //sintaxis alternativa para las pruebas

var log4js = require('log4js');
var log = log4js.getLogger("test");

describe('server', function () {
  	/*before(function () {
		boot();
  	});*/
	
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
	
	/*after(function () {
  		shutdown();
	});*/
});