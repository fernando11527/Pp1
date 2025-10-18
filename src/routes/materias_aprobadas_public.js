// Este archivo define las rutas para consultar y crear materias aprobadas
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const MateriaAprobadaRepo = require("../repositorios/MateriaAprobadaRepositorio"); // logica para materias aprobadas
const repo = new MateriaAprobadaRepo();

// Ruta para crear un registro de materia aprobada
router.post("/", async (req, res, next) => {
  try {
    const data = req.body; // Datos enviados por el usuario
    if (!data.alumnoId || !data.materiaId || !data.estado)
      return res.status(400).json({ error: "Datos incompletos" }); // Si falta algo, avisa
    const id = await repo.crear(data); // Crea el registro
    res.json({ id }); // Devuelve el id creado
  } catch (err) {
    next(err); // Si algo sale mal, pasa el error al ayudante de errores
  }
});

// Ruta para listar materias aprobadas de un alumno
router.get("/", async (req, res, next) => {
  try {
    const { alumnoId } = req.query; // Id del alumno
    if (!alumnoId)
      return res.status(400).json({ error: "falta alumnoId en query" }); // Si falta, avisa
    const lista = await repo.listarPorAlumno(alumnoId); // Busca las materias aprobadas
    res.json(lista); // Devuelve la lista
  } catch (err) {
    next(err); // Si algo sale mal, pasa el error al ayudante de errores
  }
});

module.exports = router; // Exporta el router para que se use en el servidor
