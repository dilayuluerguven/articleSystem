const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL bağlantı hatası: ", err.stack);
    return;
  }
  console.log("MySQL database connected");
  db.query(
    `
    CREATE TABLE IF NOT EXISTS form3 (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      tarih DATE DEFAULT NULL,
      a_yayin_kodlari TEXT,
      a_puanlar TEXT,
      b_yayin_kodlari TEXT,
      b_puanlar TEXT,
      c_yayin_kodlari TEXT,
      c_puanlar TEXT,
      d_yayin_kodlari TEXT,
      d_puanlar TEXT,
      e_yayin_kodlari TEXT,
      e_puanlar TEXT,
      f_yayin_kodlari TEXT,
      f_puanlar TEXT,
      g_yayin_kodlari TEXT,
      g_puanlar TEXT,
      h_yayin_kodlari TEXT,
      h_puanlar TEXT,
      i_yayin_kodlari TEXT,
      i_puanlar TEXT,
      j_yayin_kodlari TEXT,
      j_puanlar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL
    ) CHARACTER SET utf8mb4;
    `,
    (err2) => {
      if (err2) console.error("form3 table oluşturulurken hata:", err2);
    }
  );

  db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'`,
    [process.env.DB_NAME],
    (err2, rows2) => {
      if (err2) return console.error("is_admin check hata:", err2);
      if (!rows2 || rows2.length === 0) {
        db.query("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0", (err3) => {
          if (err3) console.error("is_admin eklenirken hata:", err3);
          else console.log("is_admin sütunu eklendi");
        });
      }
    }
  );
});

app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

app.post("/register", async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (!fullname || !username || !email || !password) {
    return res.status(400).json({ error: "Tüm alanlar zorunludur" });
  }

  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "Veritabanı hatası" });
        if (results.length > 0)
          return res.status(400).json({ error: "Bu email zaten kayıtlı" });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (fullname, username, email, password) VALUES (?, ?, ?, ?)",
          [fullname, username, email, hashedPassword],
          (err, result) => {
            if (err) {
              console.error("Kayıt hatası:", err);
              return res
                .status(500)
                .json({ error: "Kayıt sırasında hata oluştu" });
            }
            res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu!" });
          }
        );
      }
    );
  } catch (err) {
    console.error("Server hatası:", err);
    res.status(500).json({ error: "Server hatası" });
  }
});


// Kullanıcı login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email ve şifre zorunludur" });

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Veritabanı hatası" });
      }

      if (!results || results.length === 0)
        return res.status(400).json({ error: "Kullanıcı bulunamadı" });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(400).json({ error: "Şifre yanlış" });

      const { password: _, ...userWithoutPassword } = user;
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Giriş başarılı!",
        user: userWithoutPassword,
        token,
      });
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});


const categoriesRouter = require("./routes/categories")(db); 
app.use("/api", categoriesRouter);

const basvuruRoutes = require("./routes/basvuru")(db);
app.use("/api/basvuru", basvuruRoutes);

const ustAktiviteRouter = require("./routes/ustAktivite")(db);
app.use("/api", ustAktiviteRouter);

const form1Router = require("./routes/form1")(db);
app.use("/api/form1", form1Router);

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const form8Router = require("./routes/form8")(db);
app.use("/api/form8", form8Router);

const form7Router = require("./routes/form7")(db);
app.use("/api/form7", form7Router);

const form3Router = require("./routes/form3")(db);
app.use("/api/form3", form3Router);

const adminRouter = require("./routes/admin")(db);
app.use("/api/admin", adminRouter);

const userRoutes = require("./routes/user")(db);
app.use("/api/user", userRoutes);



app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
