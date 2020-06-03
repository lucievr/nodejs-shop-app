const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1]; // to get the token from 'Bearer {token}'
  let decodedToken;
  try {
    // verify func to decode and verify the token
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  // now that token decoded we can access properties like userId, email etc.
  req.userId = decodedToken.userId;
  next();
};
