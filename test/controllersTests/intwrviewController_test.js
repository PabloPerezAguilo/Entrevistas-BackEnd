var should = require('should'); 
var assert = require('assert');
var request = require('supertest');
var log4js = require('log4js');
var log = log4js.getLogger("Mocha del demonio");


describe('Interview Services tests', function() {
  var url = 'http://localhost:9600';

    
    
    describe('POST tests', function() {
        
        //Body vacío
        it('No body parameter test', function(done) {
            var interview={
            }
            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                done();
            });
        });
        
        //Body incompleto
        it('lack of body parameters test', function(done) {
            var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING"
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                done();
            });
        });
        
        it('Invalid dni format test', function(done) {
            var interview={
                DNI:"12345---678ASOAasmaAOSJXALSKJCA SÑOKJDASJDPÑAOJSPDAOSDUJASJ9",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 5,
                        max: 7
                    }
                ]
                
            }
            // once we have specified the info we want to send to the server via POST verb,
            // we need to actually perform the action on the resource, in this case we want to 
            // POST on /api/profiles and we want to send some info
            // We do this using the request object, requiring supertest!
            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                done();
            });
        });
        it('Invalid number type test', function(done) {
            var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: "Leroyyy",
                        max: 7
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                log.debug(err);
                log.debug(res.body);
                assert.equal(res.statusCode, 400);
                assert.equal(res.body.name, "ValidationError");
                assert.equal(res.body.message ,"The min and max values must be numbers");
                done();
            });
        });
        it('min>max', function(done) {
            var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 9,
                        max: 6
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                assert.equal(res.body.name, "ValidationError");
                assert.equal(res.body.message ,"The min value must be lower or equal to the max one");
                done();
            });
        });
        it('min=max', function(done) {
            var interview={
                DNI:"12345abc6789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 6,
                        max: 6
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 200);
                assert.equal(res.body.message, "New interview created!")
                done();
            });
        });
        
        it('number upper limit exceed test', function(done) {
            var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 5,
                        max: 11
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                assert.equal(res.body.name, "ValidationError");
                assert.equal(res.body.message ,"The min and max values must be in the interval [1,10]");
                done();
            });
        });
        it('number lower limit exceed test', function(done) {
            var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 0,
                        max: 7
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                assert.equal(res.body.name, "ValidationError");
                assert.equal(res.body.message ,"The min and max values must be in the interval [1,10]");
                done();
            });
        });
        
        it('Correct create', function(done){
             var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 5,
                        max: 7
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 200);
                done();
            });
        });
        
        it('duplicated key create', function(done){
             var interview={
                DNI:"123456789",
                name: "Selma",
                surname:"Bubie",
                status:"PENDING",
                leveledTags: [
                    {
                        tag: "tag",
                        min: 5,
                        max: 7
                    }
                ]
                
            }

            request(url)
            .post('/api/interview')
            .send(interview)
            // end handles the response
            .end(function(err, res) {           
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                done();
            });
        });
  });
});