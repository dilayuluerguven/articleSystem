const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const authMiddleware = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
router.get("/pdf", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id)
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });

    // 🔹 Kullanıcının TÜM başvurularını çek
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

    if (rows.length === 0)
      return res.status(404).json({ error: "Hiç başvuru bulunamadı" });

    // 🔹 Kategorilere göre grupla
    const grouped = rows.reduce((acc, row) => {
      const ustKod = row.ust_kod?.trim() || "Diger";
      if (!acc[ustKod]) acc[ustKod] = [];
      acc[ustKod].push(row);
      return acc;
    }, {});

    // 🔹 Word şablonunu yükle
    const templatePath = path.join(__dirname, "../FORM-7.docx");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // 🔹 Her kategori altındaki satırları biçimlendir
    const formatEntries = (entries) =>
      entries
        .map((e, i) => {
          const kod =
            e.aktivite_kod || e.alt_kod || e.ust_kod || "-";
          const eser =
            e.workDescription || e.eser || "(Eser bilgisi yok)";
          const puan = e.yazarpuanı ? ` (${e.yazarpuanı})` : "";
          return `${kod}:${i + 1} - ${eser}${puan}`;
        })
        .join("\n");

    // 🔹 Şablondaki tüm bölümleri doldur
    const sections = {};
    const harfler = [
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
      "K", "L", "M", "N", "O", "P", "R", "S"
    ];

    for (const harf of harfler) {
      sections[`${harf}_section`] =
        grouped[harf]?.length > 0 ? formatEntries(grouped[harf]) : "";
    }

    doc.render({
      username: rows[0].username || "-",
      ...sections,
    });

    // 🔹 Word oluştur
    const outputDocx = path.join(__dirname, `../uploads/form7_${user_id}.docx`);
    fs.writeFileSync(outputDocx, doc.getZip().generate({ type: "nodebuffer" }));

    // 🔹 PDF'e dönüştür
    const outputPdf = outputDocx.replace(".docx", ".pdf");
    const sofficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

    exec(
      `${sofficePath} --headless --convert-to pdf "${outputDocx}" --outdir "${path.join(
        __dirname,
        "../uploads"
      )}"`,
      (err) => {
        if (err) {
          console.error("PDF oluşturma hatası:", err);
          return res.status(500).json({ error: "PDF oluşturulamadı" });
        }

        res.download(outputPdf, `Form7_${rows[0].username}.pdf`);
      }
    );
  } catch (err) {
    console.error("Form-7 oluşturma hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

  return router;
};
