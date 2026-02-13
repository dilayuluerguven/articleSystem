const express = require("express");

const categoriesRoutes = (db) => {
  const router = express.Router();

  router.get("/categories", async (req, res) => {
    try {
      const [ustler] = await db
        .promise()
        .query("SELECT id, kod, tanim FROM ust_aktiviteler ORDER BY id");

      const [altlar] = await db
        .promise()
        .query("SELECT id, kod, tanim FROM alt_aktiviteler ORDER BY id");

      const [aktiviteler] = await db
        .promise()
        .query("SELECT id, kod, tanim FROM aktivite ORDER BY id");

      // alt_aktiviteler → node list
      const altNodes = altlar.map((alt) => ({
        id: alt.id,
        kod: alt.kod,
        tanim: alt.tanim,
        subcategories: [],
      }));

      const getParentKod = (kod) => {
        if (/^A-\d+[a-z]+$/i.test(kod)) return kod.match(/^A-\d+/i)[0];
        if (kod.includes(".")) return kod.split(".")[0];
        return null;
      };

      // aktiviteleri SADECE TEK parent'a bağla
      for (const akt of aktiviteler) {
        const parentKod = getParentKod(akt.kod);
        if (!parentKod) continue;

        const parentAlt = altNodes.find((a) => a.kod === parentKod);
        if (!parentAlt) continue;

        parentAlt.subcategories.push({
          id: akt.id,
          kod: akt.kod,
          tanim: akt.tanim,
          subcategories: [],
        });
      }
      const tree = ustler.map((ust) => ({
        id: ust.id,
        kod: ust.kod,
        tanim: ust.tanim,
        subcategories: altNodes.filter((alt) =>
          alt.kod.startsWith(ust.kod + "-")
        ),
      }));

      res.json(tree);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server hatası" });
    }
  });

  return router;
};
module.exports = categoriesRoutes;
