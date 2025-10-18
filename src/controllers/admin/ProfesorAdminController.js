const db = require("../../config/db").getDB();

module.exports = {
  async listar(req, res, next) {
    try {
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM profesores`, [], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const { nombre, apellido } = req.body;
      const id = await new Promise((resolve, reject) => {
        const db2 = require("../../config/db").getDB();
        db2.run(
          `INSERT INTO profesores (nombre, apellido) VALUES (?,?)`,
          [nombre, apellido],
          function (err) {
            db2.close();
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });
      res.json({ id });
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const db2 = require("../../config/db").getDB();
      const row = await new Promise((resolve, reject) => {
        db2.get(`SELECT * FROM profesores WHERE id = ?`, [id], (err, row) => {
          db2.close();
          if (err) return reject(err);
          resolve(row);
        });
      });
      if (!row) return res.status(404).json({ error: "No encontrado" });
      res.json(row);
    } catch (err) {
      next(err);
    }
  },

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const db3 = require("../../config/db").getDB();
      const sets = Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ");
      const params = Object.values(data).concat([id]);
      await new Promise((resolve, reject) => {
        db3.run(
          `UPDATE profesores SET ${sets} WHERE id = ?`,
          params,
          function (err) {
            db3.close();
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

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const db4 = require("../../config/db").getDB();
      await new Promise((resolve, reject) => {
        db4.run(`DELETE FROM profesores WHERE id = ?`, [id], function (err) {
          db4.close();
          if (err) return reject(err);
          resolve(this.changes);
        });
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
