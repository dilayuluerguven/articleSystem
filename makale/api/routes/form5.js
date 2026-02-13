const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("node:child_process");
const authMiddleware = require("../middleware/auth");

const form5Routes = (db) => {
  const router = express.Router();

  const templatePath = path.join(__dirname, "..", "FORM-5.docx");
  const tempDir = path.join(__dirname, "..", "temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const sofficePath = String.raw`"C:\Program Files\LibreOffice\program\soffice.exe"`;

  const formatRows = (rows) => ({
    kodlar: rows.map((r) => r.yayin_kodu).join("\n"),
    puanlar: rows.map((r) => Number(r.hamPuan || 0).toFixed(2)).join("\n")
  });

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [rows] = await db
        .promise()
        .query("SELECT * FROM form5 WHERE user_id = ? ORDER BY id DESC LIMIT 1", [
          userId
        ]);
      res.json(rows.length ? rows[0] : null);
    } catch (err) {
      console.error("FORM-5 GET error:", err);
      res.status(500).json({ error: "Form-5 bilgileri alınamadı." });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const tarih = req.body.tarih || null;

      const [result] = await db
        .promise()
        .query("INSERT INTO form5 (user_id, tarih) VALUES (?, ?)", [
          userId,
          tarih
        ]);

      const [[row]] = await db
        .promise()
        .query("SELECT * FROM form5 WHERE id = ?", [result.insertId]);

      res.json(row);
    } catch (err) {
      console.error("FORM-5 POST error:", err);
      res.status(500).json({ error: "Form-5 kaydedilemedi." });
    }
  });

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const tarih = req.body.tarih || null;

      await db
        .promise()
        .query("UPDATE form5 SET tarih = ? WHERE id = ? AND user_id = ?", [
          tarih,
          id,
          userId
        ]);

      const [[row]] = await db
        .promise()
        .query("SELECT * FROM form5 WHERE id = ?", [id]);

      res.json(row);
    } catch (err) {
      console.error("FORM-5 UPDATE error:", err);
      res.status(500).json({ error: "Form-5 güncellenemedi." });
    }
  });

  router.get("/auto", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [rows] = await db.promise().query(
        `
        SELECT b.main_selection, b.hamPuan,
        CASE
          WHEN b.aktivite_id IS NOT NULL THEN a.kod
          WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod
          ELSE ua.kod
        END AS yayin_kodu
        FROM basvuru b
        JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        WHERE b.user_id = ?
        `,
        [userId]
      );

      const aRows = rows.filter((r) => r.main_selection === "baslicaEser");

      const bCodes = new Set(["A-1a", "A-1b", "A-2a", "A-2b", "C-1", "C-2"]);
      const bRows = rows.filter((r) => bCodes.has(r.yayin_kodu));

      const kCats = ["K-1", "K-2", "K-3", "L", "M"];
      const cRows = rows.filter((r) =>
        kCats.some((k) => r.yayin_kodu?.startsWith(k))
      );

      const A = formatRows(aRows);
      const B = formatRows(bRows);
      const C = formatRows(cRows);
      const ALL = formatRows(rows);

      res.json({
        tarih: new Date().toISOString().slice(0, 10),
        a_yayin_kodlari: A.kodlar,
        a_puanlar: A.puanlar,
        b_yayin_kodlari: B.kodlar,
        b_puanlar: B.puanlar,
        c_yayin_kodlari: C.kodlar,
        c_puanlar: C.puanlar,
        d_yayin_kodlari: ALL.kodlar,
        d_puanlar: ALL.puanlar,
        e_yayin_kodlari: ALL.kodlar,
        e_puanlar: ALL.puanlar,
        f_yayin_kodlari: "",
        f_puanlar: "",
        g_yayin_kodlari: "",
        g_puanlar: "",
        h_yayin_kodlari: "",
        h_puanlar: ""
      });
    } catch (err) {
      console.error("FORM-5 AUTO error:", err);
      res.status(500).json({ error: "Otomatik hesaplama hatası." });
    }
  });

  router.post("/pdf", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [[user]] = await db
        .promise()
        .query("SELECT fullname, username FROM users WHERE id = ?", [userId]);

      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.render({
        tarih: req.body.tarih
          ? new Date(req.body.tarih).toLocaleDateString("tr-TR")
          : "",
        aday_ad_soyad: user.fullname || user.username,
        ...req.body
      });

      const buf = doc.getZip().generate({ type: "nodebuffer" });

      const safeName = (user.fullname || user.username || "user").replaceAll(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      const docxPath = path.join(tempDir, `f5_${safeName}.docx`);
      const pdfPath = path.join(tempDir, `f5_${safeName}.pdf`);

      fs.writeFileSync(docxPath, buf);

      const command = `${sofficePath} --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`;

      exec(command, async (error) => {
        if (error) {
          console.error("FORM-5 PDF convert error:", error);
          return res.status(500).json({ error: "PDF dönüştürme hatası." });
        }

        fs.readFile(pdfPath, (err, pdfBuffer) => {
          if (err) {
            console.error("FORM-5 PDF read error:", err);
            return res.status(500).json({ error: "PDF okunamadı." });
          }

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="FORM-5-${safeName}.pdf"`
          );
          res.send(pdfBuffer);
        });
      });
    } catch (err) {
      console.error("FORM-5 PDF error:", err);
      res.status(500).json({ error: "PDF oluşturulamadı." });
    }
  });

  return router;
};

module.exports = form5Routes;
