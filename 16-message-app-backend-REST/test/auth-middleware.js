const expect = require('chai').expect;

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function () {
  it('should throw an error if no authorization header is present', function () {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      // req, empty object for response, dummy function for next()
      'Not authenticated' // this must match the error message in is-auth, otherwise it will throw an error as well
    );
  });

  it('should throw an error if the auth header in only one string', function () {
    const req = {
      get: function (headerName) {
        return 'xyz';
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
