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
      yayin_kodu: data.aktivite_kod || data.alt_kod || data.ust_kod || "-",
      akademik_faaliyet:
        data.aktivite_tanim ||
        data.alt_tanim ||
        data.ust_tanim ||
        "-",
      eser: data.workDescription || data.eser || "-",
      yazar_sayisi: data.yazar_sayisi || 0,
      username: data.username || "-",

      b_eser: check(data.main_selection, "baslicaeser"),
      tek_yaz: check(data.main_selection, "tekyazar"),
      ogrenci_makale: check(data.sub_selection, "ogrenciyle"),
      tezden: check(data.child_selection, "tezden"),
      tez_harici: check(data.child_selection, "tezharici"),
      aday_tez_makale: check(data.main_selection, "adaytezyayin"),
      aday_yuksek: check(data.child_selection, "yuksek"),
      aday_doktora: check(data.child_selection, "doktora"),
      proje_makale: check(data.main_selection, "projemakale"),
      kitap_yazarligi: check(data.main_selection, "kitapyazarligi"),
      diger_faaliyet: check(data.main_selection, "digerfaaliyet"),
      docentlik_sonrasi: check(data.main_selection, "docentliksonrasi"),
      doktora_sonrasi: check(data.main_selection, "doktorasonrasi"),
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

        console.log("✅ PDF başarıyla oluşturuldu:", outputPdf);
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
