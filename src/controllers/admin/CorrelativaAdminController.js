const CorrelativaRepositorio = require("../../repositorios/CorrelativaRepositorio");
const repo = new CorrelativaRepositorio();

module.exports = {
  async listar(req, res, next) {
    try {
      res.json(await repo.listar());
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const { materiaId, correlativaId, materia_id, correlativa_id } = req.body;
      const mId = materiaId || materia_id;
      const cId = correlativaId || correlativa_id;
      if (!mId || !cId)
        return res.status(400).json({ error: 'datos incompletos' });
      await repo.crear(mId, cId);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const { materiaId, correlativaId } = req.body;
      if (!materiaId || !correlativaId)
        return res.status(400).json({ error: 'datos incompletos' });
      await repo.eliminar(materiaId, correlativaId);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },
};
