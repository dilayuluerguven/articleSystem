const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/auth"); 

module.exports = (db) => {
  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });

  const upload = multer({ storage });

  router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      const user_id = req.user?.id;
      if (!user_id) return res.status(401).json({ error: "User yok" });

      const {
        ust_aktivite,
        alt_aktivite,
        aktivite,
        yazar_sayisi,
        main_selection,
        sub_selection,
        child_selection,
      } = req.body;

      const eser = req.file ? req.file.filename : null;

      await db.promise().query(
        `INSERT INTO basvuru 
         (user_id, ust_aktivite, alt_aktivite, aktivite, eser, yazar_sayisi, main_selection, sub_selection, child_selection)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          ust_aktivite,
          alt_aktivite,
          aktivite,
          eser,
          yazar_sayisi,
          main_selection,
          sub_selection,
          child_selection,
        ]
      );

      res.json({ success: true, message: "Başvuru başarıyla kaydedildi", file: eser });
    } catch (err) {
      console.error("Başvuru ekleme hatası:", err);
      res.status(500).json({ success: false, error: "DB Hatası" });
    }
  });

  return router;
};
