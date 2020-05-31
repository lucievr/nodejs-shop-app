const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
// result of this function call with passed session object as an argument is stored in this const
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer'); // middleware for handling multipart/form-data

require('dotenv').config();

const errorController = require('./controllers/error');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-vo9l7.mongodb.net/shop`;

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf(); // created middleware for csrf protection using csurf package

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    callback(null, true); // accept file and store
  } else {
    callback(null, false); // do not store
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false })); // url encoded only parses text data not files, for example
// to handle input of type file with name image in our views and store in local file system
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use(express.static(path.join(__dirname, 'public')));
// if we have a request to /images then serve these files statically
app.use('/images', express.static(path.join(__dirname, 'images')));

// this middleware automatically sets a cookie and reads value from a cookie
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection); // must be used after we initialise the session, csurf is using that session
app.use(flash()); // also after session initialised

app.use((req, res, next) => {
  // for every request that is executed, these 2 fields will be set for the views that are rendered
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(); // method provided by the csrf middleware
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // safer to handle this usecase, in case of issues with db for example
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // in async code, inside a promise/then/catch block, must use next instead of throwing an error
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

// special middleware - error handling middleware with 4 arguments
app.use((error, req, res, next) => {
  // res.redirect('/500');
  console.log(error)
  res.status(500).render('500', {
    docTitle: 'Error occurred!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
