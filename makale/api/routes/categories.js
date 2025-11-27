const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/categories", async (req, res) => {
    try {
      const [ustResults] = await db
        .promise()
        .query("SELECT * FROM ust_aktiviteler ORDER BY id ASC");

      const [altResults] = await db
        .promise()
        .query("SELECT * FROM alt_aktiviteler ORDER BY id ASC");

      const [aktResults] = await db
        .promise()
        .query("SELECT * FROM aktivite ORDER BY id ASC");

      const allAktiviteler = [...altResults, ...aktResults];

      const buildHierarchy = (items) => {
        const map = {};
        const roots = [];

        const getParentKod = (kod) => {
          if (/^A-\d+[a-z]+$/i.test(kod)) {
            return kod.match(/^A-\d+/i)[0];
          }

          if (/^A-\d+\.\d+$/i.test(kod)) return kod.split(".")[0];

          if (/^A-\d+$/.test(kod)) return "A";

          if (/^[A-Z]-\d+[a-z]+$/i.test(kod)) {
            return kod.match(/^[A-Z]-\d+/i)[0];
          }

          if (kod.includes(".")) return kod.split(".")[0];
          if (kod.includes("-")) return kod.split("-")[0];

          return null;
        };

        items.forEach((item) => {
          item.subcategories = [];
          map[item.kod] = item;
        });

        items.forEach((item) => {
          const parentKod = getParentKod(item.kod);

          if (parentKod && map[parentKod]) {
            map[parentKod].subcategories.push(item);
          } else {
            roots.push(item);
          }
        });

        return roots;
      };

      const hiyerarsi = buildHierarchy(allAktiviteler);

      ustResults.forEach((ust) => {
        if (ust.kod === "A") {
          ust.subcategories = hiyerarsi.filter((item) =>
            item.kod.startsWith("A-")
          );

          return;
        }

        ust.subcategories = hiyerarsi.filter(
          (item) =>
            item.kod.startsWith(ust.kod + "-") ||
            item.kod.startsWith(ust.kod + ".")
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
