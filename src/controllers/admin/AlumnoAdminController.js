const AlumnoRepositorio = require("../../repositorios/AlumnoRepositorio");
const repo = new AlumnoRepositorio();

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
      await repo.actualizar(id, req.body);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await repo.eliminar(id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
