var should = require('should'); 
var assert = require('assert');
var request = require('supertest');


describe('Routing', function() {
  var url = 'http://localhost:9600';

  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
  describe('Account', function() {
    it('Test 1', function(done) {
      var tag={
          tag:"PUTO NODE"
      }
        // once we have specified the info we want to send to the server via POST verb,
        // we need to actually perform the action on the resource, in this case we want to 
        // POST on /api/profiles and we want to send some info
        // We do this using the request object, requiring supertest!
        request(url)
        .post('/api/tag')
        .send(tag)
        // end handles the response
        .end(function(err, res) {
            if (err) {
                throw err;
            }
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 400);
                done();
        });
    });
      
    
       it('Test 2', function(done) {
      var tag={
          tag:"PUTO NODE"
      }
        // once we have specified the info we want to send to the server via POST verb,
        // we need to actually perform the action on the resource, in this case we want to 
        // POST on /api/profiles and we want to send some info
        // We do this using the request object, requiring supertest!
        request(url)
        .get('/api/tag')
        // end handles the response
        .end(function(err, res) {
            if (err) {
                throw err;
            }
                // this is should.js syntax, very clear
                assert.equal(res.statusCode, 200);
                done();
        });
    });
    /*it('should correctly update an existing account', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');                    
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});*/
  });
});