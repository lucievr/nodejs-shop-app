const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1]; // to get the token from 'Bearer {token}'
  let decodedToken;
  try {
    // verify func to decode and verify the token
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  // now that token decoded we can access properties like userId, email etc.
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
