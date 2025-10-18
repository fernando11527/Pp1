const db = require("../../config/db").getDB();

module.exports = {
  async crear(req, res, next) {
    try {
      const { materiaId, correlativaId } = req.body;
      if (!materiaId || !correlativaId)
        return res.status(400).json({ error: "datos incompletos" });
      const db2 = require("../../config/db").getDB();
      const id = await new Promise((resolve, reject) => {
        db2.run(
          `INSERT OR IGNORE INTO correlativas (materia_id, correlativa_id) VALUES (?,?)`,
          [materiaId, correlativaId],
          function (err) {
            db2.close();
            if (err) return reject(err);
            resolve(this.lastID || 0);
          }
        );
      });
      res.json({ ok: true, id });
    } catch (err) {
      next(err);
    }
  },

  async eliminar(req, res, next) {
    try {
      const { materiaId, correlativaId } = req.body;
      if (!materiaId || !correlativaId)
        return res.status(400).json({ error: "datos incompletos" });
      const db2 = require("../../config/db").getDB();
      await new Promise((resolve, reject) => {
        db2.run(
          `DELETE FROM correlativas WHERE materia_id = ? AND correlativa_id = ?`,
          [materiaId, correlativaId],
          function (err) {
            db2.close();
            if (err) return reject(err);
            resolve(this.changes);
          }
        );
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async listar(req, res, next) {
    try {
      const db2 = require("../../config/db").getDB();
      const filas = await new Promise((resolve, reject) => {
        db2.all(`SELECT * FROM correlativas`, [], (err, rows) => {
          db2.close();
          if (err) return reject(err);
          resolve(rows || []);
        });
      });
      res.json(filas);
    } catch (err) {
      next(err);
    }
  },
};
