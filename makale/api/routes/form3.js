const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("node:child_process");
const authMiddleware = require("../middleware/auth");

const form3Routes = (db) => {
  const router = express.Router();

  const templatePath = path.join(__dirname, "..", "FORM-3.docx");
  const tempDir = path.join(__dirname, "..", "temp");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const sofficePath = String.raw`"C:\Program Files\LibreOffice\program\soffice.exe"`;


  router.post("/pdf", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [[user]] = await db
        .promise()
        .query("SELECT fullname, username FROM users WHERE id = ?", [userId]);

      const safeName = (user?.fullname || user?.username || "kullanici")
        .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g, "_");

      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.render({
        tarih: req.body.tarih
          ? new Date(req.body.tarih).toLocaleDateString("tr-TR")
          : "",
        aday_ad_soyad: user?.fullname || user?.username || "",

        a_yayin_kodlari: req.body.a_yayin_kodlari || "-",
        a_puanlar: req.body.a_puanlar || "-",
        b_yayin_kodlari: req.body.b_yayin_kodlari || "-",
        b_puanlar: req.body.b_puanlar || "-",
        c_yayin_kodlari: req.body.c_yayin_kodlari || "-",
        c_puanlar: req.body.c_puanlar || "-",
        d_yayin_kodlari: req.body.d_yayin_kodlari || "-",
        d_puanlar: req.body.d_puanlar || "-",
        e_yayin_kodlari: req.body.e_yayin_kodlari || "-",
        e_puanlar: req.body.e_puanlar || "-",
        f_yayin_kodlari: req.body.f_yayin_kodlari || "-",
        f_puanlar: req.body.f_puanlar || "-",
        g_yayin_kodlari: req.body.g_yayin_kodlari || "-",
        g_puanlar: req.body.g_puanlar || "-",
        h_yayin_kodlari: req.body.h_yayin_kodlari || "-",
        h_puanlar: req.body.h_puanlar || "-",
        i_yayin_kodlari: req.body.i_yayin_kodlari || "-",
        i_puanlar: req.body.i_puanlar || "-",
        j_yayin_kodlari: req.body.j_yayin_kodlari || "-",
        j_puanlar: req.body.j_puanlar || "-",
      });

      const buf = doc.getZip().generate({ type: "nodebuffer" });
      const docxPath = path.join(tempDir, `FORM-3-${safeName}.docx`);
      const pdfPath = path.join(tempDir, `FORM-3-${safeName}.pdf`);

      fs.writeFileSync(docxPath, buf);

      exec(
        `${sofficePath} --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`,
        () => {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="FORM-3-${safeName}.pdf"`
          );
          res.send(fs.readFileSync(pdfPath));
        }
      );
    } catch (err) {
      console.error("FORM-3 PDF hata:", err);
      res.status(500).json({ error: "PDF oluşturulamadı." });
    }
  });

  router.get("/auto", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [rows] = await db.promise().query(
        `
        SELECT
          b.hamPuan AS puan,
          b.main_selection,
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

      const format = (items) => ({
        kodlar: items.length ? items.map(i => i.yayin_kodu).join("\n") : "-",
        puanlar: items.length
          ? items.map(i => Number(i.puan || 0).toFixed(2)).join("\n")
          : "-"
      });

      const aItems = rows.filter(r => r.main_selection === "baslicaEser");

      const usedInA = new Set(aItems.map(r => r.yayin_kodu));

      const bAllowed = ["A-1a", "A-1b", "A-2a", "C-1"];

      const bItems = rows.filter(r =>
        !usedInA.has(r.yayin_kodu) &&
        bAllowed.some(k => (r.yayin_kodu || "").startsWith(k))
      );

      const usedInB = new Set(bItems.map(r => r.yayin_kodu));

      const byLetter = (letter) =>
        rows.filter(r =>
          !usedInA.has(r.yayin_kodu) &&
          !usedInB.has(r.yayin_kodu) &&
          (r.yayin_kodu || "").toLowerCase().startsWith(letter)
        );

      return res.json({
        tarih: new Date().toISOString().slice(0, 10),

        a_yayin_kodlari: format(aItems).kodlar,
        a_puanlar: format(aItems).puanlar,

        b_yayin_kodlari: format(bItems).kodlar,
        b_puanlar: format(bItems).puanlar,

        c_yayin_kodlari: format(byLetter("c")).kodlar,
        c_puanlar: format(byLetter("c")).puanlar,

        d_yayin_kodlari: format(byLetter("d")).kodlar,
        d_puanlar: format(byLetter("d")).puanlar,

        e_yayin_kodlari: format(byLetter("e")).kodlar,
        e_puanlar: format(byLetter("e")).puanlar,

        f_yayin_kodlari: format(byLetter("f")).kodlar,
        f_puanlar: format(byLetter("f")).puanlar,

        g_yayin_kodlari: format(byLetter("g")).kodlar,
        g_puanlar: format(byLetter("g")).puanlar,

        h_yayin_kodlari: format(byLetter("h")).kodlar,
        h_puanlar: format(byLetter("h")).puanlar,

        i_yayin_kodlari: format(byLetter("i")).kodlar,
        i_puanlar: format(byLetter("i")).puanlar,

        j_yayin_kodlari: format(byLetter("j")).kodlar,
        j_puanlar: format(byLetter("j")).puanlar,
      });
    } catch (err) {
      console.error("FORM-3 AUTO hata:", err);
      res.status(500).json({ error: "Auto doldurma hatası" });
    }
  });

  return router;
};
module.exports = form3Routes;

