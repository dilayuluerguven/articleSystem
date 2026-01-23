const dbProvider = require('../db');

function adminMiddlewareFactory(db) {
  async function adminMiddleware(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }

      const [rows] = await db
        .promise()
        .query('SELECT is_admin FROM users WHERE id = ?', [userId]);

      if (!rows.length || !rows[0].is_admin) {
        return res.status(403).json({ error: 'Yönetici izni gerekli' });
      }

      next();
    } catch (err) {
      console.error('adminMiddleware hata:', err);
      res.status(500).json({ error: 'Sunucu hatası' });
    }
  }

  return adminMiddleware;
}

module.exports = adminMiddlewareFactory;
