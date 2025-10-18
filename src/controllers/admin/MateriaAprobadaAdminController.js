const MateriaAprobadaRepo = require("../../repositorios/MateriaAprobadaRepositorio");
const repo = new MateriaAprobadaRepo();

module.exports = {
  async listar(req, res, next) {
    try {
      const lista = (await repo.obtenerTodos)
        ? await repo.obtenerTodos()
        : await repo.listarPorAlumno(req.query.alumnoId || null);
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const data = req.body;
      const id = await repo.crear(data);
      res.json({ id });
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const db = require("../../config/db").getDB();
      const row = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM materias_aprobadas WHERE id = ?`,
          [id],
          (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row);
          }
        );
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
      const db = require("../../config/db").getDB();
      const sets = Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ");
      const params = Object.values(data).concat([id]);
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE materias_aprobadas SET ${sets} WHERE id = ?`,
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
          `DELETE FROM materias_aprobadas WHERE id = ?`,
          [id],
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
};
