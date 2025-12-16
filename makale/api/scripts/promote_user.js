require('dotenv').config();
const mysql = require('mysql2');

const email = process.argv[2];
if (!email) {
  console.error('Kullanım: node scripts/promote_user.js user@example.com');
  process.exit(1);
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('DB bağlantı hatası:', err);
    process.exit(1);
  }

  db.query('UPDATE users SET is_admin = 1 WHERE email = ?', [email], (err2, result) => {
    if (err2) {
      console.error('Güncelleme hatası:', err2);
      process.exit(1);
    }

    console.log('Güncellendi:', result.affectedRows);
    process.exit(0);
  });
});
