const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function() {
  it('should throw an error with code 500 if accessing the database fails', function(done) { // done used with async code
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'tester'
      }
    }

    AuthController.login(req, {}, () => {}).then(result => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done(); // telling mocha to wait for this async code to resolve before considering this test run as done
    });

    User.findOne.restore();
  })
});