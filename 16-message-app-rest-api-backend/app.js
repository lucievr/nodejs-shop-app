const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-vo9l7.mongodb.net/messages`;

const app = express();

app.use(bodyParser.json()); // application/json, parsing json from incoming requests, stored in req.body
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

app.use((error, req, res, next) => {
  console.log(error, 'error');
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
