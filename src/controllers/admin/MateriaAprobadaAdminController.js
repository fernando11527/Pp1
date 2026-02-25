const MateriaAprobadaRepo = require("../../repositorios/MateriaAprobadaRepositorio");
const repo = new MateriaAprobadaRepo();

module.exports = {
  async listar(req, res, next) {
    try {
      const { alumnoId } = req.query;
      const lista = alumnoId
        ? await repo.listarPorAlumno(alumnoId)
        : await repo.listarTodos();
      res.json(lista);
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
      if (!obj) return res.status(404).json({ error: 'No encontrado' });
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
