const InscripcionRepositorio = require("../../repositorios/InscripcionRepositorio");
const repo = new InscripcionRepositorio();

module.exports = {
  async listar(req, res, next) {
    try {
      const lista = await repo.listarTodos();
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const { id } = req.params;
      const obj = await repo.obtenerConMaterias(id);
      if (!obj) return res.status(404).json({ error: "No encontrado" });
      res.json(obj);
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const data = req.body; // { alumnoId, periodoId, materiasIds }
      const ins = {
        fechaInscripcion: new Date().toISOString(),
        alumnoInscriptoId: data.alumnoId,
        periodoId: data.periodoId,
      };
      const id = await repo.crear(ins);
      // insertar materias
      const db = require("../../config/db").getDB();
      await new Promise((resolve, reject) => {
        const stmt = db.prepare(
          `INSERT INTO inscripcion_materia (inscripcion_id, materia_id) VALUES (?,?)`
        );
        for (const m of data.materiasIds || []) stmt.run(id, m);
        stmt.finalize((err) => {
          db.close();
          if (err) return reject(err);
          resolve();
        });
      });
      res.json({ id });
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
          `DELETE FROM inscripcion_materia WHERE inscripcion_id = ?`,
          [id],
          function (err) {
            if (err) return reject(err);
            resolve();
          }
        );
      });
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM inscripciones WHERE id = ?`, [id], function (err) {
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
