const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Belirli üst aktivite için
  router.get("/categories/:ustKod", async (req, res) => {
    const { ustKod } = req.params;

    try {
      // Üst aktiviteyi bul
      db.query(
        "SELECT * FROM üst_aktiviteler WHERE kod = ?",
        [ustKod],
        (err, ustResults) => {
          if (err) return res.status(500).json({ error: "Üst aktivite hatası" });
          if (ustResults.length === 0) return res.status(404).json({ error: "Üst aktivite bulunamadı" });

          const ust = ustResults[0];
          ust.subcategories = [];

          // Orta seviye aktiviteler
          db.query(
            "SELECT * FROM aktivite WHERE ust_aktivite_id = ? ORDER BY id ASC",
            [ust.id],
            (err2, aktResults) => {
              if (err2) return res.status(500).json({ error: "Aktivite hatası" });

              const aktMap = {};
              aktResults.forEach((akt) => {
                akt.subcategories = [];
                aktMap[akt.id] = akt;
              });

              // Alt aktiviteler
              db.query(
                "SELECT * FROM alt_aktiviteler ORDER BY id ASC",
                (err3, altResults) => {
                  if (err3) return res.status(500).json({ error: "Alt aktivite hatası" });

                  altResults.forEach((alt) => {
                    if (alt.aktivite_id && aktMap[alt.aktivite_id]) {
                      aktMap[alt.aktivite_id].subcategories.push(alt);
                    }
                  });

                  // Aktiviteleri üst aktiviteye ekle
                  ust.subcategories = Object.values(aktMap);

                  res.json(ust);
                }
              );
            }
          );
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server hatası" });
    }
  });

  return router;
};
