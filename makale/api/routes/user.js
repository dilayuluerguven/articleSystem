const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); 

const userRoutes = (db) => {
  router.get("/me", authMiddleware, async (req, res) => {
    try {
      const [rows] = await db
        .promise()
        .query(
          "SELECT id,fullname,username, email, created_at FROM users WHERE id = ?",
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

  router.put("/update", authMiddleware, async (req, res) => {
    try {
      const {fullname, username, email, password } = req.body;
      const userId = req.user.id;

      let hashedPassword = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      const [result] = await db
        .promise()
        .query(
          "UPDATE users SET fullname=?,username = ?, email = ?, password = IFNULL(?, password) WHERE id = ?",
          [fullname,username, email, hashedPassword, userId]
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
module.exports = userRoutes;
