const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./utils/file');

require('dotenv').config();

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-vo9l7.mongodb.net/messages`;

const app = express();

const fileStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'images'); // null for no error
  },
  filename: function (req, file, callback) {
    callback(
      null,
      new Date().toISOString().replace(/:/g, '-') + file.originalname
    );
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    callback(null, true); // accept file
  } else {
    callback(null, false); // do not accept
  }
};

app.use(bodyParser.json()); // application/json, parsing json from incoming requests, stored in req.body
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

// to overwrite default CORS setting
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow specific origins to access our data, * wildcard for all origins
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  ); // allow these http methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // allow to set content type and auth
  if (req.method === 'OPTIONS') {
    // OPTIONS method not allowed for graphql endpoints
    return res.sendStatus(200);
  }
  next();
});

  // REST API endpoint for uploading images, graphql only handles json data
app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: 'File stored', filePath: req.file.path });
});

app.use(auth);

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error has occurred!';
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error, 'error');
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
