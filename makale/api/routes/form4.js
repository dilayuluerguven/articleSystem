const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("node:child_process");
const authMiddleware = require("../middleware/auth");

const form4Routes = (db) => {
  const router = express.Router();

  const templatePath = path.join(__dirname, "..", "FORM-4.docx");
  const tempDir = path.join(__dirname, "..", "temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const sofficePath = String.raw`"C:\Program Files\LibreOffice\program\soffice.exe"`;

  const formatData = (rows) => ({
    kodlar: rows.map((r) => r.yayin_kodu).join("\n"),
    puanlar: rows.map((r) => Number(r.hamPuan || 0).toFixed(2)).join("\n")
  });

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [rows] = await db.promise().query(
        "SELECT * FROM form4 WHERE user_id = ? ORDER BY id DESC LIMIT 1",
        [userId]
      );
      res.json(rows.length ? rows[0] : null);
    } catch (err) {
      console.error("FORM-4 GET error:", err);
      res.status(500).json({ error: "Form-4 bilgileri alınamadı." });
    }
  });

  router.get("/auto", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [rows] = await db.promise().query(
        `
        SELECT 
            b.main_selection,
            b.hamPuan,
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

      const bCodes = new Set([
        "A-1a", "A-1b", "A-1g", "A-2a", "A-2b", "A-3a", "C-1", "C-2"
      ]);

      const bRows = rows.filter(
        (r) =>
          bCodes.has(r.yayin_kodu) &&
          r.main_selection !== "baslicaEser"
      );

      const cCodes = new Set([
        "A-1a","A-1b","A-1g","A-2a","A-2b","A-3a","A-4a",
        "D-1","B","C-1","C-2"
      ]);

      const cRows = rows.filter(
        (r) =>
          cCodes.has(r.yayin_kodu) &&
          r.main_selection !== "baslicaEser" &&
          !bRows.includes(r)
      );

      const dCats = ["B", "C", "D", "E", "F"];

      const dRows = rows.filter(
        (r) =>
          dCats.includes(r.yayin_kodu[0]) &&
          r.main_selection !== "baslicaEser" &&
          !bRows.includes(r) &&
          !cRows.includes(r)
      );

      const eCats = ["K", "L", "M"];
      const eRows = rows.filter((r) => eCats.includes(r.yayin_kodu[0]));

      const dataA = formatData(aRows);
      const dataB = formatData(bRows);
      const dataC = formatData(cRows);
      const dataD = formatData(dRows);
      const dataE = formatData(eRows);
      const dataAll = formatData(rows);

      res.json({
        tarih: new Date().toISOString().slice(0, 10),

        a_yayin_kodlari: dataA.kodlar,
        a_puanlar: dataA.puanlar,

        b_yayin_kodlari: dataB.kodlar,
        b_puanlar: dataB.puanlar,

        c_yayin_kodlari: dataC.kodlar,
        c_puanlar: dataC.puanlar,

        d_yayin_kodlari: dataD.kodlar,
        d_puanlar: dataD.puanlar,

        e_yayin_kodlari: dataE.kodlar,
        e_puanlar: dataE.puanlar,

        f_yayin_kodlari: "",
        f_puanlar: "",

        g_yayin_kodlari: dataAll.kodlar,
        g_puanlar: dataAll.puanlar,

        h_yayin_kodlari: dataAll.kodlar,
        h_puanlar: dataAll.puanlar,

        i_yayin_kodlari: "",
        i_puanlar: "",

        j_yayin_kodlari: "",
        j_puanlar: ""
      });

    } catch (err) {
      console.error("FORM-4 AUTO error:", err);
      res.status(500).json({ error: "Otomatik veriler hesaplanamadı." });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [result] = await db
        .promise()
        .query("INSERT INTO form4 SET ?", [{ ...req.body, user_id: userId }]);

      const [[saved]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ?", [result.insertId]);

      res.json(saved);
    } catch (err) {
      console.error("FORM-4 CREATE error:", err);
      res.status(500).json({ error: "Form-4 kaydedilemedi." });
    }
  });

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      await db.promise().query(
        "UPDATE form4 SET ? WHERE id = ? AND user_id = ?",
        [req.body, req.params.id, userId]
      );

      const [[updated]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ?", [req.params.id]);

      res.json(updated);
    } catch (err) {
      console.error("FORM-4 UPDATE error:", err);
      res.status(500).json({ error: "Form-4 güncellenemedi." });
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

      const safeName = (user.fullname || user.username || "kullanici")
        .replaceAll(/[^a-zA-Z0-9]/g, "_");

      const docxPath = path.join(tempDir, `form4-${safeName}.docx`);
      const pdfPath = path.join(tempDir, `form4-${safeName}.pdf`);

      fs.writeFileSync(docxPath, buf);

      exec(
        `${sofficePath} --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`,
        (error) => {
          if (error) {
            console.error("PDF convert error:", error);
            return res.status(500).json({ error: "PDF dönüştürme hatası." });
          }

          fs.readFile(pdfPath, (err, pdfBuffer) => {
            if (err) {
              console.error("PDF read error:", err);
              return res.status(500).json({ error: "PDF okunamadı." });
            }

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="FORM-4-${safeName}.pdf"`
            );
            res.send(pdfBuffer);
          });
        }
      );
    } catch (err) {
      console.error("FORM-4 PDF error:", err);
      res.status(500).json({ error: "PDF oluşturulamadı." });
    }
  });

  return router;
};

module.exports = form4Routes;
