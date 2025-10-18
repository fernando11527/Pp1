const MateriaRepositorio = require("../../repositorios/MateriaRepositorio");
const repo = new MateriaRepositorio();

module.exports = {
  async listar(req, res, next) {
    try {
      const lista = (await repo.obtenerTodos)
        ? await repo.obtenerTodos()
        : await repo.listarPorCarrera(null);
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
          `UPDATE materias SET ${sets} WHERE id = ?`,
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
        db.run(`DELETE FROM materias WHERE id = ?`, [id], function (err) {
          db.close();
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
