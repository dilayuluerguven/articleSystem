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
      if (!user_id)
        return res.status(401).json({ error: "Kullanıcı bulunamadı" });

      let {
        ust_aktivite_id,
        alt_aktivite_id,
        aktivite_id,
        yazar_sayisi,
        main_selection,
        sub_selection,
        child_selection,
        workDescription,
        authorPosition,
      } = req.body;

      const eser = req.file ? req.file.filename : null;
      const is_first_author = authorPosition === "ilk" ? 1 : 0;

      const [yazarRows] = await db.promise().query(
        `
        SELECT 
          CASE 
            WHEN ? = 1 THEN ilk_isim 
            ELSE digerleri 
          END AS katsayi
        FROM yazar_puanlar
        WHERE yazar_sayisi = ?
        `,
        [is_first_author, yazar_sayisi]
      );

      const yazarpuanı = yazarRows[0]?.katsayi || 0.0;

     let hamPuan = 0.0;
let puanId = null;

// 1️⃣ Aktivite seviyesi: puan_id'yi bul ve puanı çek
if (aktivite_id && !isNaN(aktivite_id)) {
  const [aRow] = await db
    .promise()
    .query("SELECT puan_id FROM aktivite WHERE id = ?", [aktivite_id]);
  puanId = aRow[0]?.puan_id || null;

  if (puanId) {
    const [p] = await db
      .promise()
      .query("SELECT puan FROM akademik_puanlar WHERE id = ?", [puanId]);
    hamPuan = p[0]?.puan || 0.0;
  }
}

// 2️⃣ Eğer bulunmadıysa alt_aktivite'den dene
if (!puanId && alt_aktivite_id && !isNaN(alt_aktivite_id)) {
  const [altRow] = await db
    .promise()
    .query("SELECT puan_id FROM alt_aktiviteler WHERE id = ?", [alt_aktivite_id]);
  puanId = altRow[0]?.puan_id || null;

  if (puanId) {
    const [p] = await db
      .promise()
      .query("SELECT puan FROM akademik_puanlar WHERE id = ?", [puanId]);
    hamPuan = p[0]?.puan || 0.0;
  }
}

// 3️⃣ Hâlâ bulunamadıysa ust_aktivite seviyesinden dene
if (!puanId && ust_aktivite_id && !isNaN(ust_aktivite_id)) {
  const [p] = await db
    .promise()
    .query(
      "SELECT puan FROM akademik_puanlar WHERE ana_aktivite_id = ? ORDER BY puan DESC LIMIT 1",
      [ust_aktivite_id]
    );
  hamPuan = p[0]?.puan || 0.0;
}

const toplamPuan = parseFloat((hamPuan * yazarpuanı).toFixed(2));


      await db.promise().query(
        `
        INSERT INTO basvuru 
        (user_id, ust_aktivite_id, alt_aktivite_id, aktivite_id, eser, yazar_sayisi,
        main_selection, sub_selection, child_selection, workDescription,
        is_first_author, yazarpuanı, hamPuan, toplamPuan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user_id,
          Number(ust_aktivite_id) || null,
          Number(alt_aktivite_id) || null,
          isNaN(Number(aktivite_id)) ? null : Number(aktivite_id),
          eser,
          Number(yazar_sayisi),
          main_selection || null,
          sub_selection || null,
          child_selection || null,
          workDescription || null,
          is_first_author ? 1 : 0,
          yazarpuanı || 0,
          hamPuan || 0,
          toplamPuan || 0,
        ]
      );

      res.json({
        success: true,
        message: "Başvuru başarıyla kaydedildi.",
        file: eser,
        yazar_sayisi,
        yazarpuanı,
        hamPuan,
        toplamPuan,
      });
    } catch (err) {
      console.error("Başvuru ekleme hatası:", err);
      res.status(500).json({ success: false, error: "Veritabanı hatası" });
    }
  });


  router.get("/", authMiddleware, async (req, res) => {
    try {
      const user_id = req.user?.id;
      console.log("Token’dan gelen user_id:", user_id);
      if (!user_id)
        return res.status(401).json({ error: "Kullanıcı bulunamadı" });

      const [rows] = await db.promise().query(
        `
      SELECT 
        b.id,
        b.user_id,
        b.eser,
        b.yazar_sayisi,
        b.main_selection,
        b.sub_selection,
        b.child_selection,
        b.workDescription,
        b.is_first_author,
        b.yazarpuanı,
        b.created_at,

        ua.id AS ust_aktivite_id,
        ua.kod AS ust_kod,
        ua.tanim AS ust_tanim,

        aa.id AS alt_aktivite_id,
        aa.kod AS alt_kod,
        aa.tanim AS alt_tanim,

        a.id AS aktivite_id,
        a.kod AS aktivite_kod,
        a.tanim AS aktivite_tanim

      FROM basvuru b
      LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
      LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
      LEFT JOIN aktivite a ON b.aktivite_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      `,
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
