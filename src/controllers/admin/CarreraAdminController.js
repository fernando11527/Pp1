const CarreraRepositorio = require("../../repositorios/CarreraRepositorio");
const repo = new CarreraRepositorio();

module.exports = {
  async listar(req, res, next) {
    try {
      const lista = await repo.listar();
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const { nombre } = req.body;
      const db = require("../../config/db").getDB();
      const id = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO carreras (nombre) VALUES (?)`,
          [nombre],
          function (err) {
            db.close();
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
      const obj = await repo.obtenerPorId(id);
      if (!obj) return res.status(404).json({ error: "No encontrado" });
      res.json(obj);
    } catch (err) {
      next(err);
    }
  },

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const db = require("../../config/db").getDB();
      const sets = Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ");
      const params = Object.values(data).concat([id]);
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE carreras SET ${sets} WHERE id = ?`,
          params,
          function (err) {
            db.close();
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
      const db = require("../../config/db").getDB();
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM carrera_materia WHERE carrera_id = ?`,
          [id],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM carreras WHERE id = ?`, [id], function (err) {
          db.close();
          if (err) return reject(err);
          resolve();
        });
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async asignarMaterias(req, res, next) {
    try {
      const { id } = req.params; // carrera id
      const { materiasIds } = req.body; // array de ids
      if (!Array.isArray(materiasIds))
        return res.status(400).json({ error: "materiasIds debe ser array" });
      const db = require("../../config/db").getDB();
      await new Promise((resolve, reject) => {
        const stmt = db.prepare(
          `INSERT OR IGNORE INTO carrera_materia (carrera_id, materia_id) VALUES (?,?)`
        );
        for (const m of materiasIds) stmt.run(id, m);
        stmt.finalize((err) => {
          db.close();
          if (err) return reject(err);
          resolve();
        });
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
