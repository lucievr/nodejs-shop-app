const mysql = require('mysql2');

// create a pool of connections, multiple queries can be run, pool is closed when our app shuts down
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node-complete',
  password: 'rootroot',
});

module.exports = pool.promise(); 
// this will allow us to use promises instead of callbacks to handle our data, we can use promise chains instead of nested callbacks