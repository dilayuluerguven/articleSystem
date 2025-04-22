const express = require("express");
const mysql = require("mysql2");  //mysql2 install edildi
const app = express();
const port = 5000;

const db = mysql.createConnection({
  host: 'localhost',  //sunucu adresi
  user: 'root',       //kullanıcı adı
  password: 'dilay123',      
  database: 'articleSystem'  // veritabanı adı
});

db.connect((err) => {
  if (err) {
    console.error('MySQL bağlantı hatası: ', err.stack);
    return;
  }
  console.log('MySQL database connected');
});

app.get("/", (req, res) => {
  res.send("Helloooo");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
