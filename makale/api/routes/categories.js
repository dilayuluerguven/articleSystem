const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/categories", async (req, res) => {
    try {
      const [ustResults] = await db
        .promise()
        .query("SELECT * FROM üst_aktiviteler ORDER BY id ASC");

      const [altResults] = await db
        .promise()
        .query("SELECT * FROM alt_aktiviteler ORDER BY id ASC");

      const [aktResults] = await db
        .promise()
        .query("SELECT * FROM aktivite ORDER BY id ASC");

      altResults.forEach((alt) => {
        alt.subcategories = aktResults.filter(
          (a) => a.alt_aktivite_id === alt.id
        );
      });

      ustResults.forEach((ust) => {
        ust.subcategories = altResults.filter(
          (alt) => alt.aktivite_id === ust.id
        );
      });

      res.json(ustResults);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server hatası" });
    }
  });

  return router;
};
