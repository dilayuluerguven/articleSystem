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

        items.forEach((item) => {
          item.subcategories = [];
          map[item.kod] = item;
        });

        items.forEach((item) => {
          const idx = item.kod.lastIndexOf(".");
          const parent = idx !== -1 ? item.kod.substring(0, idx) : null;

          if (parent && map[parent]) map[parent].subcategories.push(item);
          else roots.push(item);
        });

        const sortRecursive = (arr) => {
          arr.sort((a, b) => a.id - b.id);
          arr.forEach(
            (i) => i.subcategories.length > 0 && sortRecursive(i.subcategories)
          );
        };

        sortRecursive(roots);
        return roots;
      };

      const hiyerarsi = buildHierarchy(allAktiviteler);

      ustResults.forEach((ust) => {
        ust.subcategories = hiyerarsi.filter(
          (item) => item.kod.startsWith(ust.kod + "-") || item.kod === ust.kod
        );
      });

      const aRoot = ustResults.find((u) => u.kod === "A");

      if (aRoot) {
        const aSub = aRoot.subcategories;

        const groups = {
          "A-1": [],
          "A-2": [],
          "A-3": [],
          "A-4": [],
          "A-5": [],
          "A-6": [],
        };

        aSub.forEach((item) => {
          const kod = item.kod;

          if (kod.startsWith("A-1")) groups["A-1"].push(item);
          else if (kod.startsWith("A-2")) groups["A-2"].push(item);
          else if (kod.startsWith("A-3")) groups["A-3"].push(item);
          else if (kod.startsWith("A-4")) groups["A-4"].push(item);
          else if (kod.startsWith("A-5")) groups["A-5"].push(item);
          else if (kod.startsWith("A-6")) groups["A-6"].push(item);
        });

        const build = (kod, arr) => {
          const root = arr.find((x) => x.kod === kod) || {
            id: null,
            kod,
            tanim: kod,
          };

          const subs = arr.filter((x) => x.kod !== kod);

          return {
            ...root,
            subcategories: subs,
          };
        };

        aRoot.subcategories = [
          build("A-1", groups["A-1"]),
          build("A-2", groups["A-2"]),
          build("A-3", groups["A-3"]),
          build("A-4", groups["A-4"]),
          build("A-5", groups["A-5"]),
          build("A-6", groups["A-6"]),
        ];
      }

      res.json(ustResults);
    } catch (err) {
      res.status(500).json({ error: "Server hatası" });
    }
  });

  return router;
};
