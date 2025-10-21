const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/categories", async (req, res) => {
    try {
      // Üst aktiviteleri al
      const [ustResults] = await db
        .promise()
        .query("SELECT * FROM üst_aktiviteler ORDER BY id ASC");

      // Alt aktiviteleri al
      const [altResults] = await db
        .promise()
        .query("SELECT * FROM alt_aktiviteler ORDER BY id ASC");

      // Aktivite tablosunu al (alt-alt aktiviteler)
      const [aktResults] = await db
        .promise()
        .query("SELECT * FROM aktivite ORDER BY id ASC");

      // Tüm alt ve alt-alt aktiviteleri birleştir
      const allAktiviteler = [...altResults, ...aktResults];

      // Hiyerarşi kurma fonksiyonu (parent kod son noktadan önceki kısmı)
      const buildHierarchy = (items) => {
        const map = {};
        const roots = [];

        // Map oluştur ve subcategories alanını ekle
        items.forEach((item) => {
          item.subcategories = [];
          map[item.kod] = item;
        });

        // Her item için parent kodu bul ve subcategories ekle
        items.forEach((item) => {
          const lastDotIndex = item.kod.lastIndexOf('.');
          const parentKod = lastDotIndex !== -1 ? item.kod.substring(0, lastDotIndex) : null;

          if (parentKod && map[parentKod]) {
            map[parentKod].subcategories.push(item);
          } else {
            roots.push(item); // üst seviye
          }
        });

        // Recursive sıralama
        const sortRecursive = (arr) => {
          arr.sort((a, b) => a.id - b.id);
          arr.forEach((i) => {
            if (i.subcategories.length > 0) sortRecursive(i.subcategories);
          });
        };
        sortRecursive(roots);

        return roots;
      };

      const hiyerarşi = buildHierarchy(allAktiviteler);

      // Üst aktivitelerin subcategories alanına bağla
      ustResults.forEach((ust) => {
        ust.subcategories = hiyerarşi.filter(
          (item) => item.kod.startsWith(ust.kod + '-') || item.kod === ust.kod
        );
      });

      // JSON olarak döndür
      res.json(ustResults);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server hatası" });
    }
  });

  return router;
};
