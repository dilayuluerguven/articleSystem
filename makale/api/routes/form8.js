const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  router.get("/:id/pdf", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user?.id;

      const [rows] = await db.promise().query(
        `
          SELECT 
            b.*, 
            u.username,
            ua.kod AS ust_kod,
            ua.tanim AS ust_tanim,
            aa.kod AS alt_kod,
            aa.tanim AS alt_tanim,
            a.kod AS aktivite_kod,
            a.tanim AS aktivite_tanim
          FROM basvuru b
          JOIN users u ON b.user_id = u.id
          LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
          LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
          LEFT JOIN aktivite a ON b.aktivite_id = a.id
          WHERE b.id = ? AND b.user_id = ?
        `,
        [id, user_id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Başvuru bulunamadı" });

      const data = rows[0];

      const [sameCategoryRows] = await db.promise().query(
        `
          SELECT id, created_at
          FROM basvuru
          WHERE user_id = ?
          AND (
            ust_aktivite_id = ? OR 
            alt_aktivite_id = ? OR 
            aktivite_id = ?
          )
          ORDER BY created_at ASC
        `,
        [user_id, data.ust_aktivite_id, data.alt_aktivite_id, data.aktivite_id]
      );

      let orderNumber;

      if (data.aktivite_kod && data.aktivite_kod.startsWith("A-")) {
        const aktKod = data.aktivite_kod;

        const [aRows] = await db.promise().query(
          `
            SELECT b.id, b.created_at
            FROM basvuru b
            JOIN aktivite a ON b.aktivite_id = a.id
            WHERE b.user_id = ?
            AND a.kod = ?
            ORDER BY b.created_at ASC
          `,
          [user_id, aktKod]
        );

        orderNumber = aRows.findIndex((r) => r.id === data.id) + 1;
      } else {
        orderNumber =
          sameCategoryRows.findIndex((r) => r.id === data.id) + 1;
      }

     
      const yayinKodu = `${
        data.aktivite_kod || data.alt_kod || data.ust_kod || "-"
      }:${orderNumber}`;

   
      const templatePath = path.join(__dirname, "../FORM-8-template.docx");
      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const check = (selected, value) => {
        if (!selected || !value) return "☐";
        return selected.toString().trim().toLowerCase() ===
          value.toString().trim().toLowerCase()
          ? "☑"
          : "☐";
      };

      doc.render({
        yayin_kodu: yayinKodu,
        akademik_faaliyet:
          data.aktivite_tanim || data.alt_tanim || data.ust_tanim || "-",
        eser: data.workDescription || data.eser || "-",
        yazar_sayisi: data.yazar_sayisi || 0,
        username: data.username || "-",

        b_eser: check(data.main_selection, "baslicaEser"),
        tek_yaz: check(data.sub_selection, "tekYazarli"),
        ogrenci_makale: check(data.sub_selection, "ogrenciyle"),
        tezden: check(data.child_selection, "tezden"),
        tez_harici: check(data.child_selection, "tezHarici"),
        aday_tez_makale: check(data.sub_selection, "adayTez"),
        aday_yuksek: check(data.child_selection, "yuksekLisans"),
        aday_doktora: check(data.child_selection, "doktora"),
        proje_makale: check(data.sub_selection, "projedenMakale"),
        kitap_yazarligi: check(data.sub_selection, "kitap"),
        diger_faaliyet: check(data.main_selection, "digerFaaliyet"),
        docentlik_sonrasi: check(data.main_selection, "docentlikSonrasi"),
        doktora_sonrasi: check(data.main_selection, "doktoraSonrasi"),
      });

      const outputDocx = path.join(
        __dirname,
        `../uploads/form8_${data.id}.docx`
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
        (err, stdout, stderr) => {
          console.log("LibreOffice stdout:", stdout);
          console.error("LibreOffice stderr:", stderr);
          if (err) {
            console.error("PDF oluşturma hatası:", err);
            return res.status(500).json({ error: "PDF oluşturulamadı" });
          }

          res.download(outputPdf, `Form8_${data.username}.pdf`);
        }
      );
    } catch (err) {
      console.error("Form-8 oluşturma hatası:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });

  return router;
};
