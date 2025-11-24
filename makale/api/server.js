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

// MySQL bağlantısı
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
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// Kullanıcı kayıt
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

const userRoutes = require("./routes/user")(db);
app.use("/api/user", userRoutes);



app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
