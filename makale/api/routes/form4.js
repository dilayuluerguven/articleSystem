const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  const templatePath = path.join(__dirname, "..", "FORM-4.docx");
  const tempDir = path.join(__dirname, "..", "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const sofficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';

  const formatData = (rows) => ({
    kodlar: rows.map((r) => r.yayin_kodu).join("\n"),
    puanlar: rows.map((r) => Number(r.hamPuan || 0).toFixed(2)).join("\n"),
  });

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [rows] = await db
        .promise()
        .query(
          "SELECT * FROM form4 WHERE user_id = ? ORDER BY id DESC LIMIT 1",
          [userId]
        );
      res.json(rows.length ? rows[0] : null);
    } catch (err) {
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

      const bCodes = [
        "A-1a",
        "A-1b",
        "A-1g",
        "A-2a",
        "A-2b",
        "A-3a",
        "C-1",
        "C-2",
      ];
      const bRows = rows.filter(
        (r) =>
          bCodes.includes(r.yayin_kodu) && r.main_selection !== "baslicaEser"
      );

      const cCodes = [
        "A-1a",
        "A-1b",
        "A-1g",
        "A-2a",
        "A-2b",
        "A-3a",
        "A-4a",
        "D-1",
        "B",
        "C-1",
        "C-2",
      ];
      const cRows = rows.filter(
        (r) =>
          cCodes.includes(r.yayin_kodu) &&
          r.main_selection !== "baslicaEser" &&
          !bRows.some((br) => br === r)
      );

      const dCats = ["B", "C", "D", "E", "F"];
      const dRows = rows.filter(
        (r) =>
          dCats.some((cat) => r.yayin_kodu.startsWith(cat)) &&
          r.main_selection !== "baslicaEser" &&
          !bRows.some((br) => br === r) &&
          !cRows.some((cr) => cr === r)
      );

      const eCats = ["K", "L", "M"];
      const eRows = rows.filter((r) =>
        eCats.some((cat) => r.yayin_kodu.startsWith(cat))
      );

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
        j_puanlar: "",
      });
    } catch (err) {
      res.status(500).json({ error: "Otomatik veriler hesaplanamadı." });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const data = { ...req.body, user_id: userId };
      const [result] = await db
        .promise()
        .query("INSERT INTO form4 SET ?", [data]);
      const [[saved]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ?", [result.insertId]);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: "Form-4 kaydedilemedi." });
    }
  });

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await db
        .promise()
        .query("UPDATE form4 SET ? WHERE id = ? AND user_id = ?", [
          req.body,
          id,
          userId,
        ]);
      const [[updated]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ?", [id]);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Form-4 güncellenemedi." });
    }
  });

  router.post("/pdf", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [userRows] = await db
        .promise()
        .query("SELECT fullname, username FROM users WHERE id = ?", [userId]);
      const user = userRows[0];
      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        tarih: req.body.tarih
          ? new Date(req.body.tarih).toLocaleDateString("tr-TR")
          : "",
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
        h_puanlar: req.body.h_puanlar || "",
        i_yayin_kodlari: req.body.i_yayin_kodlari || "",
        i_puanlar: req.body.i_puanlar || "",
        j_yayin_kodlari: req.body.j_yayin_kodlari || "",
        j_puanlar: req.body.j_puanlar || "",
      });

      const buf = doc.getZip().generate({ type: "nodebuffer" });
      const safeName = (user.fullname || user.username || "kullanici").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      const docxPath = path.join(tempDir, `form4-${safeName}.docx`);
      const pdfPath = path.join(tempDir, `form4-${safeName}.pdf`);

      fs.writeFileSync(docxPath, buf);
      const command = `${sofficePath} --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`;

      exec(command, (error) => {
        if (error)
          return res.status(500).json({ error: "PDF dönüştürme hatası." });
        fs.readFile(pdfPath, (err, pdfBuffer) => {
          if (err) return res.status(500).json({ error: "PDF okunamadı." });
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="FORM-4-${safeName}.pdf"`
          );
          res.send(pdfBuffer);
        });
      });
    } catch (err) {
      res.status(500).json({ error: "PDF oluşturulamadı." });
    }
  });

  return router;
};
