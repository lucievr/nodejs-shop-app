const express = require('express'); // initialise new app as an express app
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// parses the body of the request and calls next() under the hood (data sent through a form, not all types of data)

app.use(express.static(path.join(__dirname, 'public'))); // for serving static files

// app.use((req, res, next) => { // allows us to add a new middleware function which will be executed for every incoming request
//  console.log('This always runs');
//  next(); // next needs to be called here to allow the request to continue to the next middleware function
// });

app.use('/admin', adminRoutes); // filtering paths - only handling paths starting with /admin/... 
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html')); // methods can be chained
});

app.listen(3000);
