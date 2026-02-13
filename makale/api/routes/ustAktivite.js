const ustAktiviteRoutes = (db) => {
  const express = require("express");
  const router = express.Router();

 router.get("/ust-aktivite", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT `kod`, `tanim` FROM `ust_aktiviteler` ORDER BY `kod`"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Üst aktiviteler alınamadı!" });
  }
});


  return router;
};
module.exports = ustAktiviteRoutes;

