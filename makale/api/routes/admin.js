const express = require('express');
const authMiddleware = require('../middleware/auth');
const adminMiddlewareFactory = require('../middleware/admin');

module.exports = (db) => {
  const router = express.Router();
  const adminMiddleware = adminMiddlewareFactory(db);

  router.use(authMiddleware);
  router.use(adminMiddleware);

  router.get('/users', async (req, res) => {
    try {
      const [rows] = await db.promise().query('SELECT id, fullname, username, email, is_admin, created_at FROM users ORDER BY id DESC');
      res.json(rows);
    } catch (err) {
      console.error('ADMIN /users hata:', err);
      res.status(500).json({ error: 'Kullanıcılar alınırken hata oluştu' });
    }
  });

  router.put('/users/:id/promote', async (req, res) => {
    try {
      const { id } = req.params;
      const { is_admin } = req.body;
      await db.promise().query('UPDATE users SET is_admin = ? WHERE id = ?', [is_admin ? 1 : 0, id]);
      res.json({ success: true });
    } catch (err) {
      console.error('ADMIN promote hata:', err);
      res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
    }
  });

  router.delete('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err) {
      console.error('ADMIN delete user hata:', err);
      res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu' });
    }
  });

  router.get('/basvuru', async (req, res) => {
    try {
      const [rows] = await db.promise().query(
        `
        SELECT
          b.*, ua.kod AS ust_kod, aa.kod AS alt_kod, a.kod AS aktivite_kod
        FROM basvuru b
        LEFT JOIN ust_aktiviteler ua ON b.ust_aktivite_id = ua.id
        LEFT JOIN alt_aktiviteler aa ON b.alt_aktivite_id = aa.id
        LEFT JOIN aktivite a ON b.aktivite_id = a.id
        ORDER BY b.created_at DESC
        `
      );
      res.json(rows);
    } catch (err) {
      console.error('ADMIN /basvuru hata:', err);
      res.status(500).json({ error: 'Başvurular alınırken hata oluştu' });
    }
  });

  router.put('/basvuru/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        ust_aktivite_id,
        alt_aktivite_id,
        aktivite_id,
        yazar_sayisi,
        main_selection,
        sub_selection,
        child_selection,
        workDescription,
      } = req.body;

      await db.promise().query(
        `UPDATE basvuru SET ust_aktivite_id = ?, alt_aktivite_id = ?, aktivite_id = ?, yazar_sayisi = ?, main_selection = ?, sub_selection = ?, child_selection = ?, workDescription = ? WHERE id = ?`,
        [
          ust_aktivite_id || null,
          alt_aktivite_id || null,
          aktivite_id || null,
          yazar_sayisi || null,
          main_selection || null,
          sub_selection || null,
          child_selection || null,
          workDescription || null,
          id,
        ]
      );

      res.json({ success: true });
    } catch (err) {
      console.error('ADMIN basvuru update hata:', err);
      res.status(500).json({ error: 'Başvuru güncellenirken hata oluştu' });
    }
  });

  router.delete('/basvuru/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query('DELETE FROM basvuru WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err) {
      console.error('ADMIN basvuru delete hata:', err);
      res.status(500).json({ error: 'Başvuru silinirken hata oluştu' });
    }
  });

  router.get('/form3', async (req, res) => {
    try {
      const [rows] = await db.promise().query('SELECT f.*, u.fullname, u.username FROM form3 f JOIN users u ON f.user_id = u.id ORDER BY f.id DESC');
      res.json(rows);
    } catch (err) {
      console.error('ADMIN /form3 hata:', err);
      res.status(500).json({ error: 'Form3 kayıtları alınırken hata oluştu' });
    }
  });

  router.put('/form3/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const fields = Object.keys(payload);
      if (!fields.length) return res.status(400).json({ error: 'Güncellenecek alan yok' });

      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      const values = fields.map((f) => payload[f]);
      await db.promise().query(`UPDATE form3 SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
      res.json({ success: true });
    } catch (err) {
      console.error('ADMIN form3 update hata:', err);
      res.status(500).json({ error: 'Form3 güncellenirken hata oluştu' });
    }
  });

  router.delete('/form3/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query('DELETE FROM form3 WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err) {
      console.error('ADMIN form3 delete hata:', err);
      res.status(500).json({ error: 'Form3 silinirken hata oluştu' });
    }
  });
   const ALLOWED_TABLES = {
    ust_aktiviteler: ["kod", "tanim"],
    alt_aktiviteler: ["aktivite_id", "kod", "tanim", "puan_id"],
    aktivite: ["alt_aktivite_id", "kod", "tanim", "puan_id"],
    akademik_puanlar: [
      "ana_aktivite_id",
      "alt_aktivite_id",
      "aktivite_id",
      "alt_kategori",
      "puan",
    ],
    yazar_puanlar: ["yazar_sayisi", "ilk_isim", "digerleri"],
  };

  // 📌 LİSTELE
  router.get("/ref/:table", async (req, res) => {
    const { table } = req.params;
    if (!ALLOWED_TABLES[table])
      return res.status(403).json({ error: "Erişim yok" });

    const [rows] = await db.promise().query(`SELECT * FROM ${table}`);
    res.json(rows);
  });

  // 📌 EKLE
  router.post("/ref/:table", async (req, res) => {
    const { table } = req.params;
    const allowed = ALLOWED_TABLES[table];
    if (!allowed) return res.status(403).json({ error: "Erişim yok" });

    const fields = allowed.filter(f => req.body[f] !== undefined);
    if (!fields.length)
      return res.status(400).json({ error: "Alan yok" });

    const values = fields.map(f => req.body[f]);
    const placeholders = fields.map(() => "?").join(",");

    await db.promise().query(
      `INSERT INTO ${table} (${fields.join(",")}) VALUES (${placeholders})`,
      values
    );

    res.json({ success: true });
  });

  // 📌 GÜNCELLE
  router.put("/ref/:table/:id", async (req, res) => {
    const { table, id } = req.params;
    const allowed = ALLOWED_TABLES[table];
    if (!allowed) return res.status(403).json({ error: "Erişim yok" });

    const fields = allowed.filter(f => req.body[f] !== undefined);
    if (!fields.length)
      return res.status(400).json({ error: "Alan yok" });

    const setClause = fields.map(f => `${f}=?`).join(",");
    const values = fields.map(f => req.body[f]);

    await db.promise().query(
      `UPDATE ${table} SET ${setClause} WHERE id=?`,
      [...values, id]
    );

    res.json({ success: true });
  });

  // 📌 SİL
  router.delete("/ref/:table/:id", async (req, res) => {
    const { table, id } = req.params;
    if (!ALLOWED_TABLES[table])
      return res.status(403).json({ error: "Erişim yok" });

    try {
      await db.promise().query(`DELETE FROM ${table} WHERE id=?`, [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({
        error: "Bu kayıt başka tablolar tarafından kullanılıyor",
      });
    }
  });

  return router;
};
