const crypto = require('crypto'); // built-in node library

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '1a3564fd1e5a81',
    pass: '9113d4df92e98b',
  },
});

exports.getLogin = (req, res, next) => {
  // display whatever error message is stored under key 'error', after that this info is removed from the session
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password) // compares the pwd entered and stored in request with hashed pwd stored in db, using bcrypt algorithm to verify
        .then((isMatching) => {
          if (isMatching) {
            // set session only if auth was successful
            req.session.isLoggedIn = true;
            req.session.user = user; // store user in the session
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req); // any errors thrown by the middleware check('email').isEmail()
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
    });
  }
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'A user with this email address already exists.');
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12) // generate a hashed password
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'shop@node-complete.com',
            subject: 'You have signed up!',
            html:
              '<h1>Hello and welcome to node shop. You have successfully signed up to our service. </h1>',
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour in milliseconds
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'shop@node-complete.com',
          subject: 'Password Reset',
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token; // '/reset/:token'
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }, // condition that resetTokenExpiration is greater than current time
  })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        docTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(), // to pass userId through hidden input
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => console.log(err));
};
