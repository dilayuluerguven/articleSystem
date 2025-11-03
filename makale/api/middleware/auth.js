const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // 1️⃣ Token hem header hem query paramdan gelebilir
  const authHeader = req.headers.authorization;
  const token =
    (authHeader && authHeader.split(" ")[1]) || req.query.token || null;

  if (!token) return res.status(401).json({ error: "Token yok" });

  try {
    // 2️⃣ Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // kullanıcı bilgilerini ekle
    next();
  } catch (err) {
    console.error("Token doğrulama hatası:", err.message);
    return res.status(401).json({ error: "Token geçersiz" });
  }
};

module.exports = authMiddleware;
