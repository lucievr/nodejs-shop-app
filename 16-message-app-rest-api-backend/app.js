const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const MONGODB_URI = `mongodb://localhost:27017/messages`;

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
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

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
