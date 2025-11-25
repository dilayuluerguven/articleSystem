const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/categories", async (req, res) => {
    try {
      const [ust] = await db.promise().query("SELECT * FROM ust_aktiviteler");
      const [alt] = await db.promise().query("SELECT * FROM alt_aktiviteler");
      const [akt] = await db.promise().query("SELECT * FROM aktivite");

      const normalAlt = alt.filter((x) => !x.kod.startsWith("A-"));
      const normalAkt = akt.filter((x) => !x.kod.startsWith("A-"));

      const all = [...normalAlt, ...normalAkt];

      const map = {};
      all.forEach((item) => (map[item.kod] = { ...item, subcategories: [] }));

      all.forEach((item) => {
        const parts = item.kod.split("-");
        if (parts.length > 1) {
          const parentCode = parts[0] + "-" + parts[1].split(".")[0];
          if (map[parentCode] && parentCode !== item.kod) {
            map[parentCode].subcategories.push(map[item.kod]);
          }
        }
      });

      ust.forEach((u) => {
        if (u.kod !== "A") {
          u.subcategories = Object.values(map).filter((x) =>
            x.kod.startsWith(u.kod + "-")
          );
        }
      });

      const aRoot = ust.find((x) => x.kod === "A");
      if (aRoot) {
        const a1 = [];
        const a2 = [];
        const a3 = [];
        const a4 = [];
        const a5 = [];
        const a6 = [];

        alt.forEach((a) => {
          if (a.kod === "A-1") a1.push(a);
          if (a.kod === "A-2") a2.push(a);
          if (a.kod === "A-3") a3.push(a);
          if (a.kod === "A-4") a4.push(a);
          if (a.kod === "A-5") a5.push(a);
          if (a.kod === "A-6") a6.push(a);
        });

        const child = (group, code) =>
          akt.filter((x) => new RegExp(`^${code}[a-z]$`, "i").test(x.kod));

        aRoot.subcategories = [
          { ...a1[0], subcategories: child(a1, "A-1") },
          { ...a2[0], subcategories: child(a2, "A-2") },
          { ...a3[0], subcategories: child(a3, "A-3") },
          { ...a4[0], subcategories: child(a4, "A-4") },
          { ...a5[0], subcategories: [] },
          { ...a6[0], subcategories: [] },
        ];
      }

      res.json(ust);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server hatası" });
    }
  });

  return router;
};
