// const fs = require('fs').promises;
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // global objects __filename & __dirname not available with ES modules
const __dirname = dirname(__filename); // absolute paths to them need to be constructed like this

// promises in core nodejs modules
export const resHandler = (req, res, next) => {
  fs.readFile('my-page.html', 'utf8')
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
  // res.sendFile(path.join(__dirname, 'my-page.html'));
};

// module.exports = resHandler;
// export default resHandler;
