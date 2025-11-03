const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  const uploadDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  });

  const upload = multer({ storage });

// POST - Başvuru ekle
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
            workDescription,
            authorPosition,
        } = req.body;

        const eser = req.file ? req.file.filename : null;
        const is_first_author = authorPosition === "ilk" ? 1 : 0; 
        
        const [puanRows] = await db.promise().query(
            `SELECT 
                CASE 
                    WHEN ? = 1 THEN ilk_isim 
                    ELSE digerleri 
                END AS puan
            FROM yazar_puanlar
            WHERE yazar_sayisi = ?`,
            [is_first_author, yazar_sayisi]
        );
        
        const yazarpuanı = puanRows.length > 0 ? puanRows[0].puan : 0.0; 

        await db.promise().query(
            `INSERT INTO basvuru 
            (user_id, ust_aktivite, alt_aktivite, aktivite, eser, yazar_sayisi, main_selection, sub_selection, child_selection, workDescription, is_first_author, yazarpuanı)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
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
                workDescription,
                is_first_author,
                yazarpuanı, 
            ]
        );

        res.json({
            success: true,
            message: "Başvuru başarıyla kaydedildi",
            file: eser,
            yazarpuanı: yazarpuanı, 
        });
    } catch (err) {
        console.error("Başvuru ekleme hatası:", err);
        res.status(500).json({ success: false, error: "DB Hatası" });
    }
});
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const user_id = req.user?.id;
      console.log("Token’dan gelen user_id:", user_id);
      if (!user_id)
        return res.status(401).json({ error: "Kullanıcı bulunamadı" });

      const [rows] = await db.promise().query(
        `SELECT b.*,
              ua.tanim AS ust_aktivite_tanim,
              aa.tanim AS alt_aktivite_tanim,
              a.tanim AS aktivite_tanim
       FROM basvuru b
       LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite = ua.kod
       LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite = aa.kod
       LEFT JOIN aktivite a ON b.aktivite = a.kod
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
        [user_id]
      );

      console.log("DB’den gelen satır sayısı:", rows.length);
      res.json(rows);
    } catch (err) {
      console.error("Başvuru listeleme hatası:", err);
      res.status(500).json({ error: "Veri çekme hatası" });
    }
  });

  router.put(
    "/:id",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
      try {
        const { id } = req.params;
        const user_id = req.user?.id;
        const {
          ust_aktivite,
          alt_aktivite,
          aktivite,
          yazar_sayisi,
          main_selection,
          sub_selection,
          child_selection,
          workDescription,
          authorPosition,
        } = req.body;

        const [oldRows] = await db
          .promise()
          .query("SELECT eser FROM basvuru WHERE id = ? AND user_id = ?", [
            id,
            user_id,
          ]);

        if (oldRows.length === 0)
          return res.status(404).json({ error: "Başvuru bulunamadı" });

        let eser = oldRows[0].eser;

        if (req.file) {
          const oldFile = path.join(uploadDir, eser);
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
          eser = req.file.filename;
        }

        const is_first_author = authorPosition === "ilk" ? 1 : 0;

        await db.promise().query(
          `UPDATE basvuru
       SET ust_aktivite=?, alt_aktivite=?, aktivite=?, eser=?, yazar_sayisi=?, main_selection=?, sub_selection=?, child_selection=?, workDescription=?, is_first_author=?
       WHERE id=? AND user_id=?`,
          [
            ust_aktivite,
            alt_aktivite,
            aktivite,
            eser,
            yazar_sayisi,
            main_selection,
            sub_selection,
            child_selection,
            workDescription,
            is_first_author,
            id,
            user_id,
          ]
        );

        res.json({ success: true, message: "Başvuru güncellendi", file: eser });
      } catch (err) {
        console.error("Başvuru güncelleme hatası:", err);
        res.status(500).json({ error: "Güncelleme işlemi başarısız" });
      }
    }
  );

  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user?.id;

      const [rows] = await db
        .promise()
        .query("SELECT eser FROM basvuru WHERE id = ? AND user_id = ?", [
          id,
          user_id,
        ]);

      if (rows.length === 0)
        return res.status(404).json({ error: "Başvuru bulunamadı" });

      const filePath = path.join(uploadDir, rows[0].eser);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await db
        .promise()
        .query("DELETE FROM basvuru WHERE id = ? AND user_id = ?", [
          id,
          user_id,
        ]);

      res.json({ success: true, message: "Başvuru silindi" });
    } catch (err) {
      console.error("Başvuru silme hatası:", err);
      res.status(500).json({ error: "Silme işlemi başarısız" });
    }
  });

  return router;
};
