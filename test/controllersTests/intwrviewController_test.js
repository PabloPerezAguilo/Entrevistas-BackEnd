var should = require('should'); 
var assert = require('assert');
var request = require('supertest');


describe('Interview Services tests', function() {
  var url = 'http://localhost:9600';

    
    
    describe('POST tests', function() {
        
        //Body vacío
        it.skip('No body parameter test', function(done) {
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
        it.skip('lack of body parameters test', function(done) {
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
        
        // -------------------------------Invalid types test and limits
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
                assert.equal(res.statusCode, 400);
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
                done();
            });
        });
        
        it('number limits exceed test', function(done) {
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
        
        it.skip('duplicated key create', function(done){
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