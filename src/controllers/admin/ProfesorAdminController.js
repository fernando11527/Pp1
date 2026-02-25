const ProfesorRepositorio = require("../../repositorios/ProfesorRepositorio");
const repo = new ProfesorRepositorio();

module.exports = {
  async listar(req, res, next) {
    try {
      res.json(await repo.listar());
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const id = await repo.crear(req.body);
      res.json({ id });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const obj = await repo.obtenerPorId(req.params.id);
      if (!obj) return res.status(404).json({ error: "No encontrado" });
      res.json(obj);
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      await repo.actualizar(req.params.id, req.body);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      await repo.eliminar(req.params.id);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },
};
