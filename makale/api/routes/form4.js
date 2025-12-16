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

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const sofficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [[form]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE user_id = ?", [userId]);
      res.json(form || null);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Form alınamadı" });
    }
  });

  router.get("/auto", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const [[form]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE user_id = ?", [userId]);
      res.json(form || {});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Otomatik doldurma hatası" });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const fields = Object.keys(req.body).map((k) => `${k} = ?`).join(", ");
      const values = Object.values(req.body);

      const [result] = await db
        .promise()
        .query(`INSERT INTO form4 SET user_id = ?, ${fields}`, [
          userId,
          ...values,
        ]);

      const [[saved]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ?", [result.insertId]);

      res.json(saved);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Form kaydedilemedi" });
    }
  });

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const fields = Object.keys(req.body).map((k) => `${k} = ?`).join(", ");
      const values = Object.values(req.body);

      await db
        .promise()
        .query(`UPDATE form4 SET ${fields} WHERE id = ? AND user_id = ?`, [
          ...values,
          id,
          userId,
        ]);

      const [[updated]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ?", [id]);

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Form güncellenemedi" });
    }
  });

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
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      tarih: req.body.tarih
        ? new Date(req.body.tarih).toLocaleDateString("tr-TR")
        : "",

      aday_adi: user?.fullname || user?.username || "",

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
    const docxPath = path.join(tempDir, `FORM-4-${safeName}.docx`);
    const pdfPath = path.join(tempDir, `FORM-4-${safeName}.pdf`);

    fs.writeFileSync(docxPath, buf);

    exec(
      `${sofficePath} --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`,
      () => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="FORM-4-${safeName}.pdf"`
        );
        res.send(fs.readFileSync(pdfPath));
      }
    );
  } catch (err) {
    console.error("FORM-4 PDF hata:", err);
    res.status(500).json({ error: "PDF oluşturulamadı." });
  }
});



  router.post("/:id/pdf", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const [[form]] = await db
        .promise()
        .query("SELECT * FROM form4 WHERE id = ? AND user_id = ?", [
          id,
          userId,
        ]);

      if (!form) {
        return res.status(404).json({ error: "Form bulunamadı" });
      }

      req.body = form;
      return router.stack
        .find((r) => r.route?.path === "/pdf")
        .route.stack[0].handle(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "PDF oluşturulamadı" });
    }
  });

  return router;
};
