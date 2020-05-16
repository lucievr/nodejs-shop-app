const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const expressHbs = require('express-handlebars');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

// app.engine('hbs', expressHbs({ defaultLayout: '' })); // initialise express handlebars engine, with no layout
// app.engine('hbs', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'main-layout', extname: 'hbs'}))
// app.set('view engine', 'hbs');
// app.set('view engine', 'pug'); // setting templating engine to Pug

app.set('view engine', 'ejs');
app.set('views', 'views'); // pointing to where the views folder is (redundant as it is /views)

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render('404', { docTitle: 'Page Not Found' });
});

app.listen(3000);
