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
          ap.puan AS akademik_puan,
          b.workDescription,
          b.yazarPuani,
          b.main_selection,
          b.hamPuan,
          b.toplamPuan
        FROM basvuru b
        LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        LEFT JOIN akademik_puanlar ap ON a.puan_id = ap.id
        WHERE b.user_id = ?
        ORDER BY ua.id, aa.id, a.id
        `,
        [userId]
      );

      const grouped = {};
      const counters = {};

      rows.forEach((r) => {
        const ustKey = r.ust_kod;

        if (!grouped[ustKey]) {
          grouped[ustKey] = {
            ust_kod: r.ust_kod,
            ust_tanim: r.ust_tanim,
            items: {},
          };
        }

        const baseKod = r.aktivite_kod ?? r.alt_kod ?? r.ust_kod;

        if (!grouped[ustKey].items[baseKod]) {
          grouped[ustKey].items[baseKod] = {
            kod: baseKod,
            tanim: r.aktivite_tanim ?? r.alt_tanim ?? r.ust_tanim,
            hamPuan: r.akademik_puan ?? r.hamPuan ?? "",
            belgeler: [],
          };
        }

        if (!counters[baseKod]) counters[baseKod] = 1;
        const index = counters[baseKod]++;

        const ham = r.akademik_puan ?? r.hamPuan ?? 0;
        const yazar = r.yazarPuani ?? 1;
        const toplam = r.toplamPuan ?? Number(ham * yazar).toFixed(2);

        grouped[ustKey].items[baseKod].belgeler.push({
          kod: `${baseKod}:${index}`,
          eser: r.workDescription,
          hesap: `${ham} × ${yazar}`,
          toplam: Number(toplam),
          main_selection: r.main_selection,
        });
      });

      const result = Object.values(grouped).map((g) => ({
        ust_kod: g.ust_kod,
        ust_tanim: g.ust_tanim,
        items: Object.values(g.items),
      }));

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/pdf", authMiddleware, async (req, res) => {
    try {
      const user_id = req.user.id;

      const [rows] = await db.promise().query(
        `
        SELECT 
          b.*,
          u.username,
          ua.kod AS ust_kod,
          aa.kod AS alt_kod,
          a.kod AS aktivite_kod,
          ap.puan AS akademik_puan
        FROM basvuru b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        LEFT JOIN akademik_puanlar ap ON a.puan_id = ap.id
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

        const ham = e.akademik_puan ?? e.hamPuan ?? 0;
        const yazar = e.yazarPuani ?? 1;
        const toplam = e.toplamPuan ?? Number(ham * yazar).toFixed(2);

        items.push({
          kod: `${code}:${index}`,
          eser: e.workDescription,
          ham: ham,
          yazar: yazar,
          toplam: toplam,
          main_selection: e.main_selection,
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
