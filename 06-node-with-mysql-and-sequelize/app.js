const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');
const sequelize = require('./utils/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1) // we are guaranteed to have a user as this middleware func only runs after app initialised with app.listen()
    .then((user) => {
      req.user = user; // store user retrieved from db in our request, storing Sequelize user object with all its methods, not just a js object
      next(); // to continue to the next middleware
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// define associations/relations between models
// user created this product
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' }); // cascade: if user deleted product also deleted
User.hasMany(Product); // user can create many products

// syncs our models with the database by creating the appropriate tables
sequelize
  // .sync({force: true}) - used for recreating the table, e.g. when we added associations, do not use in prod!!!
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Lucie', email: 'test@gmail.com' });
    }
    // return Promise.resolve(user); // this is not needed
    return user; // if you return a value in a then block it's automatically wrapped in a new promise
  })
  .then((user) => {
    // console.log(user);
    app.listen(3000);
  })
  .catch((err) => console.log(err));
