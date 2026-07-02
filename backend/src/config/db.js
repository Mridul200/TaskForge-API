const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool scales far better than a single connection under load,
// and is one of the easy wins we call out in the scalability note.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
