const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  const templatePath = path.join(__dirname, "..", "FORM-1.docx");
  const tempDir = path.join(__dirname, "..", "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [rows] = await db
        .promise()
        .query(
          "SELECT * FROM form1 WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );

      res.json(rows.length ? rows[0] : null);
    } catch (err) {
      console.error("FORM-1 GET hata:", err);
      res
        .status(500)
        .json({ error: "Form-1 bilgileri alınırken hata oluştu." });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { tarih } = req.body;

      if (!tarih) {
        return res.status(400).json({ error: "Tarih zorunludur." });
      }

      const [result] = await db
        .promise()
        .query("INSERT INTO form1 (user_id, tarih) VALUES (?, ?)", [
          userId,
          tarih,
        ]);

      const [rows] = await db
        .promise()
        .query("SELECT * FROM form1 WHERE id = ?", [result.insertId]);

      res.json(rows[0]);
    } catch (err) {
      console.error("FORM-1 POST hata:", err);
      res.status(500).json({ error: "Form kaydedilirken hata oluştu." });
    }
  });

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { tarih } = req.body;

      if (!tarih) {
        return res.status(400).json({ error: "Tarih zorunludur." });
      }

      const [checkRows] = await db
        .promise()
        .query("SELECT * FROM form1 WHERE id = ? AND user_id = ?", [
          id,
          userId,
        ]);

      if (!checkRows.length) {
        return res.status(404).json({ error: "Kayıt bulunamadı." });
      }

      await db
        .promise()
        .query("UPDATE form1 SET tarih = ? WHERE id = ?", [tarih, id]);

      const [rows] = await db
        .promise()
        .query("SELECT * FROM form1 WHERE id = ?", [id]);

      res.json(rows[0]);
    } catch (err) {
      console.error("FORM-1 PUT hata:", err);
      res.status(500).json({ error: "Form güncellenirken hata oluştu." });
    }
  });

  router.get("/doktor/a", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [rows] = await db.promise().query(
        `
        SELECT
          b.id AS basvuru_id,
          b.eser,
          b.ust_aktivite_id,
          b.alt_aktivite_id,
          b.aktivite_id,
          CASE
            WHEN b.aktivite_id IS NOT NULL THEN a.kod
            WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
            ELSE ua.kod
          END AS yayin_kodu,
          b.hamPuan AS puan,
          ap.alt_kategori
        FROM basvuru b
        JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        LEFT JOIN akademik_puanlar ap
          ON ap.id = (
            SELECT ap2.id
            FROM akademik_puanlar ap2
            WHERE
              (ap2.aktivite_id = b.aktivite_id)
              OR (ap2.alt_aktivite_id = b.alt_aktivite_id)
              OR (ap2.ana_aktivite_id = b.ust_aktivite_id)
            ORDER BY
              CASE
                WHEN ap2.aktivite_id = b.aktivite_id THEN 1
                WHEN ap2.alt_aktivite_id = b.alt_aktivite_id THEN 2
                ELSE 3
              END
            LIMIT 1
          )
        WHERE b.user_id = ?
          AND b.main_selection = 'baslicaEser'
        ORDER BY b.id DESC
      `,
        [userId]
      );

      res.json({
        items: rows,
        count: rows.length,
        requiredMin: 1,
        meetsCondition: rows.length >= 1,
      });
    } catch (err) {
      console.error("FORM-1 /doktor/a hata:", err);
      res
        .status(500)
        .json({ error: "Başlıca eserler hesaplanırken hata oluştu." });
    }
  });
router.get("/doktor/c", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [dRows] = await db.promise().query(
      `
      SELECT
        b.id AS basvuru_id,
        b.eser,
        CASE
          WHEN b.aktivite_id IS NOT NULL THEN a.kod
          WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
          ELSE ua.kod
        END AS yayin_kodu,
        b.hamPuan
      FROM basvuru b
      JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
      LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
      LEFT JOIN aktivite a ON b.aktivite_id = a.id
      WHERE b.user_id = ?
        AND (
          (CASE
            WHEN b.aktivite_id IS NOT NULL THEN a.kod
            WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
            ELSE ua.kod
          END) LIKE 'D-1%'
          OR
          (CASE
            WHEN b.aktivite_id IS NOT NULL THEN a.kod
            WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
            ELSE ua.kod
          END) LIKE 'D-2%'
        )
      ORDER BY b.id DESC
      `,
      [userId]
    );

    const [beRows] = await db.promise().query(
      `
      SELECT
        b.id AS basvuru_id,
        b.eser,
        CASE
          WHEN b.aktivite_id IS NOT NULL THEN a.kod
          WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
          ELSE ua.kod
        END AS yayin_kodu,
        b.hamPuan
      FROM basvuru b
      JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
      LEFT JOIN alt_aktiviteLer aa ON b.alt_aktivite_id = aa.id
      LEFT JOIN aktivite a ON b.aktivite_id = a.id
      WHERE b.user_id = ?
        AND (
          (CASE
            WHEN b.aktivite_id IS NOT NULL THEN a.kod
            WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
            ELSE ua.kod
          END) LIKE 'B-1%'
          OR
          (CASE
            WHEN b.aktivite_id IS NOT NULL THEN a.kod
            WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
            ELSE ua.kod
          END) LIKE 'E-1%'
        )
      ORDER BY b.id DESC
      `,
      [userId]
    );

    const dTotal = dRows.length;
    const d1Count = dRows.filter(r => r.yayin_kodu.startsWith("D-1")).length;
    const beTotal = beRows.length;

    const meetsCondition =
      dTotal >= 2 &&
      d1Count >= 1 &&
      beTotal >= 2;

    res.json({
      dItems: dRows,
      beItems: beRows,
      dTotal,
      d1Count,
      beTotal,
      required: { dMin: 2, d1Min: 1, beMin: 2 },
      meetsCondition
    });
  } catch (err) {
    console.error("/doktor/c hata:", err);
    res.status(500).json({ error: "C maddesi hesaplanırken hata oluştu." });
  }
});



  router.get("/:id/pdf", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const [rows] = await db.promise().query(
        `
        SELECT f.*, u.fullname, u.username
        FROM form1 f
        JOIN users u ON f.user_id = u.id
        WHERE f.id = ? AND f.user_id = ?
      `,
        [id, userId]
      );

      if (!rows.length) {
        return res.status(404).json({ error: "Kayıt bulunamadı." });
      }

      const data = rows[0];

      const [aRows] = await db.promise().query(
        `
        SELECT
            b.id AS basvuru_id,
            b.eser,
            b.ust_aktivite_id,
            b.alt_aktivite_id,
            b.aktivite_id,
            CASE
              WHEN b.aktivite_id IS NOT NULL THEN a.kod
              WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
              ELSE ua.kod
            END AS yayin_kodu,
            b.hamPuan,
            ap.alt_kategori
        FROM basvuru b
        JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        LEFT JOIN akademik_puanlar ap
            ON ap.id = (
            SELECT ap2.id
            FROM akademik_puanlar ap2
            WHERE
                (ap2.aktivite_id = b.aktivite_id)
                OR (ap2.alt_aktivite_id = b.alt_aktivite_id)
                OR (ap2.ana_aktivite_id = b.ust_aktivite_id)
            ORDER BY
                CASE
                WHEN ap2.aktivite_id = b.aktivite_id THEN 1
                WHEN ap2.alt_aktivite_id = b.alt_aktivite_id THEN 2
                ELSE 3
                END
            LIMIT 1
            )
        WHERE b.user_id = ?
            AND b.main_selection = 'baslicaEser'
        ORDER BY b.id DESC
        `,
        [userId]
      );

      let aYayinKodlariText = "";
      let aPuanlarText = "";

      if (!aRows.length) {
        aYayinKodlariText = "Başlıca eser yok";
        aPuanlarText = "-";
      } else {
        const kodSatirlari = [];
        const puanSatirlari = [];

        aRows.forEach((r) => {
          let kodStr = r.yayin_kodu || "";
          if (r.alt_kategori) {
            kodStr += ` (${r.alt_kategori.trim()})`;
          }
          kodSatirlari.push(kodStr);

          if (r.hamPuan != null) {
            puanSatirlari.push(Number(r.hamPuan).toFixed(2));
          } else {
            puanSatirlari.push("-");
          }
        });

        aYayinKodlariText = kodSatirlari.join("\n");
        aPuanlarText = puanSatirlari.join("\n");
      }

      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        tarih: new Date(data.tarih).toLocaleDateString("tr-TR"),
        aday_ad_soyad: data.fullname || data.username,
        a_yayin_kodlari: aYayinKodlariText,
        a_puanlar: aPuanlarText,
      });

      const buf = doc.getZip().generate({ type: "nodebuffer" });

      const safeName = (data.fullname || data.username || "kullanici").replace(
        /[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g,
        "_"
      );

      const docxPath = path.join(tempDir, `form1-${safeName}.docx`);
      const pdfPath = path.join(tempDir, `form1-${safeName}.pdf`);

      fs.writeFileSync(docxPath, buf);

      const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`;

      exec(command, (err) => {
        if (err) {
          console.error("LibreOffice hata:", err);
          return res.status(500).json({ error: "PDF oluşturulamadı." });
        }

        fs.readFile(pdfPath, (err2, pdfBuffer) => {
          if (err2) {
            return res.status(500).json({ error: "PDF okunamadı." });
          }

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="FORM-1-${safeName}.pdf"`
          );
          res.send(pdfBuffer);
        });
      });
    } catch (err) {
      console.error("FORM-1 PDF hata:", err);
      res.status(500).json({ error: "PDF oluşturulurken hata oluştu." });
    }
  });

  return router;
};
