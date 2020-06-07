const path = require('path');
const fs = require('fs');

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath); // .. go up one level
  fs.unlink(filePath, (err) => console.log(err));
};

exports.clearImage = clearImage;