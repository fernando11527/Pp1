const InscripcionRepositorio = require("../../repositorios/InscripcionRepositorio");
const repo = new InscripcionRepositorio();

module.exports = {
  async listar(req, res, next) {
    try {
      res.json(await repo.listarTodos());
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const obj = await repo.obtenerConMaterias(req.params.id);
      if (!obj) return res.status(404).json({ error: 'No encontrado' });
      res.json(obj);
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const { alumnoId, periodoId, materiasIds } = req.body;
      const id = await repo.crear({
        fechaInscripcion: new Date().toISOString(),
        alumnoInscriptoId: alumnoId,
        periodoId,
      });
      await repo.agregarMaterias(id, materiasIds || []);
      res.json({ id });
    } catch (err) { next(err); }
  },

  async agregarMateria(req, res, next) {
    try {
      const { materiaId } = req.body;
      if (!materiaId) return res.status(400).json({ error: 'materiaId requerido' });
      await repo.agregarMateria(req.params.id, materiaId);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },

  async quitarMateria(req, res, next) {
    try {
      await repo.quitarMateria(req.params.id, req.params.materiaId);
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
