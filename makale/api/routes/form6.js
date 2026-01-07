const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
  const templatePath = path.join(__dirname, "..", "FORM-6.docx");
  const tempDir = path.join(__dirname, "..", "temp");
  
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const sofficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';

  const formatRows = (rows) => ({
    kodlar: rows.map(r => r.yayin_kodu).join("\n"),
    puanlar: rows.map(r => Number(r.hamPuan || 0).toFixed(2)).join("\n"),
  });

  router.get("/auto", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.promise().query(
      `SELECT b.main_selection, b.hamPuan, 
       CASE WHEN b.aktivite_id IS NOT NULL THEN a.kod 
            WHEN b.alt_aktivite_id IS NOT NULL THEN aa.kod 
            ELSE ua.kod END AS yayin_kodu 
       FROM basvuru b 
       JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id 
       LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id 
       LEFT JOIN aktivite a ON b.aktivite_id = a.id 
       WHERE b.user_id = ?`, [userId]
    );

    const aRows = rows.filter(r => r.main_selection === "baslicaEser");
    const bCodes = ["A-1a","A-1b","A-1g","A-2a","A-2b","A-3a","C-1","C-2"];
    const bRows = rows.filter(r => bCodes.includes(r.yayin_kodu));
    const kCats = ["K-1","K-2","K-3","L","M"];
    const cRows = rows.filter(r => kCats.some(k => r.yayin_kodu.startsWith(k)));

    const A = formatRows(aRows);
    const B = formatRows(bRows);
    const C = formatRows(cRows);
    const ALL = formatRows(rows);

    res.json({
      tarih: new Date().toISOString().slice(0,10),
      a_yayin_kodlari: A.kodlar, a_puanlar: A.puanlar,
      b_yayin_kodlari: B.kodlar, b_puanlar: B.puanlar,
      c_yayin_kodlari: C.kodlar, c_puanlar: C.puanlar,
      d_yayin_kodlari: ALL.kodlar, d_puanlar: ALL.puanlar,
      e_yayin_kodlari: ALL.kodlar, e_puanlar: ALL.puanlar,
      f_yayin_kodlari: "", f_puanlar: "",
      g_yayin_kodlari: "", g_puanlar: "",
      h_yayin_kodlari: "", h_puanlar: ""
    });
  });

  router.post("/pdf", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [[user]] = await db.promise().query("SELECT fullname, username FROM users WHERE id = ?", [userId]);
      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.render({
        tarih: req.body.tarih ? new Date(req.body.tarih).toLocaleDateString("tr-TR") : "",
        aday_ad_soyad: user.fullname || user.username,
        a_yayin_kodlari: req.body.a_yayin_kodlari || "",
        a_puanlar: req.body.a_puanlar || "",
        b_yayin_kodlari: req.body.b_yayin_kodlari || "",
        b_puanlar: req.body.b_puanlar || "",
        c_yayin_kodlari: req.body.c_yayin_kodlari || "",
        c_puanlar: req.body.c_puanlar || "",
        d_yayin_kodlari: req.body.d_yayin_kodlari || "",
        d_puanlar: req.body.d_puanlar || "",
        e_yayin_kodlari: req.body.e_yayin_kodlari || "",
        e_puanlar: req.body.e_puanlar || "",
        f_yayin_kodlari: req.body.f_yayin_kodlari || "",
        f_puanlar: req.body.f_puanlar || "",
        g_yayin_kodlari: req.body.g_yayin_kodlari || "",
        g_puanlar: req.body.g_puanlar || "",
        h_yayin_kodlari: req.body.h_yayin_kodlari || "",
        h_puanlar: req.body.h_puanlar || ""
      });

      const buf = doc.getZip().generate({ type: "nodebuffer" });
      const safeName = (user.fullname || user.username || "user").replace(/[^a-zA-Z0-9]/g, "_");
      const docxPath = path.join(tempDir, `f6_${safeName}.docx`);
      const pdfPath = path.join(tempDir, `f6_${safeName}.pdf`);

      fs.writeFileSync(docxPath, buf);
      const command = `${sofficePath} -env:UserInstallation=file:///C:/temp/lo_p6 --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`;

      exec(command, (error) => {
        if (error) return res.status(500).json({ error: "PDF Error" });
        if (fs.existsSync(pdfPath)) {
          res.download(pdfPath, `FORM-6-${safeName}.pdf`, () => {
            try {
              if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
              if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            } catch (e) {}
          });
        } else {
          res.status(500).json({ error: "Not found" });
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Server Error" });
    }
  });

  return router;
};