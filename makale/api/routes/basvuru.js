// api/basvuru.js
const express = require("express");
const multer = require("multer");
const path = require("path");

module.exports = (db) => {
  const router = express.Router();

  // Multer ayarları
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // uploads klasörünü oluşturmayı unutma
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext); // benzersiz dosya adı
    },
  });

  const upload = multer({ storage });

  router.post("/", upload.single("file"), async (req, res) => {
    const {
      user_id,
      ust_aktivite,
      alt_aktivite,
      aktivite,
      yazar_sayisi,
      main_selection,
      sub_selection,
      child_selection,
    } = req.body;

    try {
      const eser = req.file ? req.file.filename : null;

      await db
        .promise()
        .query(
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
