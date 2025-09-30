const express = require("express");
const mysql = require("mysql2");   
const bcrypt = require("bcrypt");  
const jwt = require("jsonwebtoken"); 
const cors = require("cors");      

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

require("dotenv").config(); 

const JWT_SECRET = process.env.JWT_SECRET;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası: ", err.stack);
    return;
  }
  console.log("MySQL database connected");
});

app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// Kullanıcı kayıt
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tüm alanlar zorunludur" });
  }

  try {
    // Aynı email var mı kontrol et
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Veritabanı hatası" });
      if (results.length > 0) return res.status(400).json({ error: "Bu email zaten kayıtlı" });

      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);

      // Kullanıcıyı ekle
      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Kayıt hatası:", err);
            return res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
          }
          res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu!" });
        }
      );
    });
  } catch (err) {
    console.error("Server hatası:", err);
    res.status(500).json({ error: "Server hatası" });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email ve şifre zorunludur" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Login hatası:", err);
      return res.status(500).json({ error: "Login sırasında hata oluştu" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Kullanıcı bulunamadı" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Şifre yanlış" });
    }

    const { password: pwd, ...userWithoutPassword } = user;

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Giriş başarılı!", user: userWithoutPassword, token });
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
