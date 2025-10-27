// Este archivo define las rutas para consultar periodos de inscripcion
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const PeriodoRepositorio = require("../repositorios/PeriodoRepositorio"); // para buscar periodos en la base de datos
const repo = new PeriodoRepositorio();

// Ruta para consultar el periodo que esta activo
router.get("/activo", async (req, res, next) => {
  try {
    const { carreraId } = req.query;
    if (!carreraId || isNaN(Number(carreraId))) {
      return res.status(400).json({ error: "Debe indicar un carreraId numérico" });
    }
    const p = await repo.obtenerActivoPorCarrera(carreraId); // Busca el periodo activo para esa carrera
    if (!p) return res.status(404).json({ error: "No hay periodo activo para esa carrera" });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

module.exports = router; // Exporta el router para que se use en el servidor
