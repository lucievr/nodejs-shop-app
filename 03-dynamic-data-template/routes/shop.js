const express = require('express');
const path = require('path');

const rootDir = require('../utils/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  const products = adminData.products;
  res.render('shop', {prods: products, docTitle: 'My Shop'}); 
  // no need to specify /views or shop.pug since pug is set as default engine and views also default
});

module.exports = router;
