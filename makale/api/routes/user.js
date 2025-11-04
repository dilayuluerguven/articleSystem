const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); // JWT kontrolü

module.exports = (db) => {
  // 🟢 Kullanıcı bilgilerini getir
  router.get("/me", authMiddleware, async (req, res) => {
    try {
      const [rows] = await db
        .promise()
        .query(
          "SELECT id, username, email, created_at FROM users WHERE id = ?",
          [req.user.id]
        );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("Kullanıcı verisi hatası:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });

  // 🟡 Kullanıcı bilgilerini güncelle
  router.put("/update", authMiddleware, async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const userId = req.user.id;

      // Şifre girilmişse hashle
      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      // Sorgu oluştur
      const [result] = await db
        .promise()
        .query(
          "UPDATE users SET username = ?, email = ?, password = IFNULL(?, password) WHERE id = ?",
          [username, email, hashedPassword, userId]
        );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      res.json({ message: "Bilgiler başarıyla güncellendi" });
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      res.status(500).json({ error: "Güncelleme başarısız" });
    }
  });

  return router;
};
