const express = require('express');
const { check } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    // or use body insted of check to only check req.body
    check('email').isEmail().withMessage('Please enter a valid email.'), // msg relates to check immediately before withMessage()
    check(
      'password',
      // this error message relates to all checks in the validator
      'Please enter a password with only numbers and letters and at least 5 characters long'
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
