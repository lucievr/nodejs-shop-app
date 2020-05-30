const fs = require('fs');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => { // delete file and the link to it
    if (err) {
      throw new Error(err);
    }
  });
};

exports.deleteFile = deleteFile;
