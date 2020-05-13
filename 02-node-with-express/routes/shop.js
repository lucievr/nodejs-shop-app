const express = require('express');
const path = require('path');

const rootDir = require('../utils/path');

const router = express.Router();

router.get('/', (req, res, next) => {
  // paht.join() helps us to construct the correct path to the file
  // __dirname is a global variable which holds the absolute path on our OS to our project folder
  res.sendFile(path.join(rootDir, 'views', 'shop.html')); // works on Win and Linux paths \ or /
});

module.exports = router;
