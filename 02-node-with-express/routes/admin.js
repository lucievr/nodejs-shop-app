const express = require('express');
const path = require('path');

const rootDir = require('../utils/path');

const router = express.Router();

router.get('/add-product', (req, res, next) => { // only handling get requests, for /admin/add-product
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/add-product', (req, res, next) => {
  // this middleware will only trigger for incoming post requests, for /admin/add-product
  console.log(req.body);
  res.redirect('/');
});

module.exports = router;