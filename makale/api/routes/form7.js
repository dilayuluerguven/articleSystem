const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  router.get("/data", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;

      const [rows] = await db.promise().query(
        `
      SELECT  
        b.id AS basvuru_id,
        ua.kod AS ust_kod,
        ua.tanim AS ust_tanim,
        aa.kod AS alt_kod,
        aa.tanim AS alt_tanim,
        a.kod AS aktivite_kod,
        a.tanim AS aktivite_tanim,
        b.workDescription,
        b.yazar_sayisi,
        b.hamPuan,
        b.yazarPuani AS yazarpuani,
        b.toplamPuan
      FROM basvuru b
      LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
      LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
      LEFT JOIN aktivite a ON b.aktivite_id = a.id
      WHERE b.user_id = ?
      ORDER BY ua.id, aa.id, a.id
      `,
        [userId]
      );

      const grouped = {};
      const counters = {};

      rows.forEach((r) => {
        const groupKey = r.alt_kod || r.ust_kod;

        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            ust_kod: r.ust_kod,
            ust_tanim: r.ust_tanim,
            alt_kod: r.alt_kod,
            alt_tanim: r.alt_tanim,
            items: [],
          };
        }

        const baseCode = r.aktivite_kod || r.alt_kod || r.ust_kod;

        if (!counters[baseCode]) counters[baseCode] = 1;
        const index = counters[baseCode]++;

        grouped[groupKey].items.push({
          aktivite_kod: `${baseCode}:${index}`,
          workDescription: r.workDescription,
          yazar_sayisi: r.yazar_sayisi,
          hamPuan: r.hamPuan,
          yazarpuani: r.yazarpuani,
          toplamPuan: r.toplamPuan,
        });
      });

      res.json(Object.values(grouped));
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/pdf", authMiddleware, async (req, res) => {
    try {
      const user_id = req.user?.id;

      const [rows] = await db.promise().query(
        `
        SELECT 
          b.*,
          u.username,
          ua.kod AS ust_kod, ua.tanim AS ust_tanim,
          aa.kod AS alt_kod, aa.tanim AS alt_tanim,
          a.kod AS aktivite_kod, a.tanim AS aktivite_tanim
        FROM basvuru b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        WHERE b.user_id = ?
        ORDER BY ua.id, aa.id, a.id
        `,
        [user_id]
      );

      const items = [];
      const counter = {};

      rows.forEach((e) => {
        const code = e.aktivite_kod || e.alt_kod || e.ust_kod;
        if (!counter[code]) counter[code] = 1;
        const index = counter[code]++;

        const eser = e.workDescription || "-";
        const puan = e.toplamPuan ?? e.hamPuan ?? "-";

        items.push({
          kod: `${code}:${index}`,
          index,
          eser,
          yazar_sayisi: e.yazar_sayisi || "-",
          yazarpuani: e.yazarPuani || "-",
          hamPuan: e.hamPuan || "-",
          toplamPuan: puan,
        });
      });

      const templatePath = path.join(__dirname, "../FORM-7.docx");
      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        items,
        username: rows[0].username,
      });

      const outputDocx = path.join(
        __dirname,
        `../uploads/form7_${user_id}.docx`
      );

      fs.writeFileSync(
        outputDocx,
        doc.getZip().generate({ type: "nodebuffer" })
      );

      const outputPdf = outputDocx.replace(".docx", ".pdf");
      const sofficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

      exec(
        `${sofficePath} --headless --convert-to pdf "${outputDocx}" --outdir "${path.join(
          __dirname,
          "../uploads"
        )}"`,
        () => {
          res.download(outputPdf, `Form7_${rows[0].username}.pdf`);
        }
      );
    } catch (err) {
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });

  return router;
};
