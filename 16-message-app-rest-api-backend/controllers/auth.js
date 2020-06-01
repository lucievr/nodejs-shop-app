const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'User created', userId: result._id });
    })
    .catch((err) => next(err));
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let fetchedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('A user with this email could not be found');
        error.statusCode = 401; // not authorized
        throw error;
      }
      fetchedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((passwordsMatch) => {
      if (!passwordsMatch) {
        const error = new Error('Incorrect password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: fetchedUser.email,
          userId: fetchedUser._id.toString(),
        },
        process.env.SECRET,
        { expiresIn: '1h' }
      );
      res
        .status(200)
        .json({ token: token, userId: fetchedUser._id.toString() });
    })
    .catch((err) => next(err)); // network error
};
