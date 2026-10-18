const mysql = require("mysql2");
require("dotenv").config(); 

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası: ", err.stack);
    return;
  }
  console.log("MySQL connected");
});

module.exports = db;
