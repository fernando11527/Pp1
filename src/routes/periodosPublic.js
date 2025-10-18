// Este archivo define las rutas para consultar periodos de inscripcion
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const PeriodoRepositorio = require("../repositorios/PeriodoRepositorio"); // para buscar periodos en la base de datos
const repo = new PeriodoRepositorio();

// Ruta para consultar el periodo que esta activo
router.get("/activo", async (req, res, next) => {
  try {
    const p = await repo.obtenerActivo(); // Busca el periodo activo
    if (!p) return res.status(404).json({ error: "No hay periodo activo" }); // Si no hay, avisa
    res.json(p); // Devuelve el periodo activo
  } catch (err) {
    next(err); // Si algo sale mal, pasa el error al ayudante de errores
  }
});

module.exports = router; // Exporta el router para que se use en el servidor
