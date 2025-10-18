// Este archivo define las rutas para consultar carreras y sus materias
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const CarreraRepositorio = require("../repositorios/CarreraRepositorio"); // para buscar carreras
const MateriaRepositorio = require("../repositorios/MateriaRepositorio"); // para buscar materias

const carreraRepo = new CarreraRepositorio();
const materiaRepo = new MateriaRepositorio();

// Ruta para consultar la lista de carreras
router.get("/", async (req, res, next) => {
  try {
    const carreras = await carreraRepo.listar(); // Busca todas las carreras
    res.json(carreras); // Devuelve la lista
  } catch (err) {
    next(err); // Si algo sale mal, pasa el error al ayudante de errores
  }
});

// Ruta para consultar las materias de una carrera y sus correlativas
router.get("/:id/materias", async (req, res, next) => {
  try {
    const { id } = req.params; // Id de la carrera
    const filas = await materiaRepo.listarPorCarrera(id); // Busca las materias de la carrera
    // Por cada materia, trae las correlativas (ids)
    const db = require("../config/db").getDB();
    const materias = await Promise.all(
      filas.map(async (m) => {
        const correl = await new Promise((resolve, reject) => {
          db.all(
            `SELECT correlativa_id FROM correlativas WHERE materia_id = ?`,
            [m.id],
            (err, rows) => {
              if (err) return reject(err);
              resolve((rows || []).map((r) => r.correlativa_id));
            }
          );
        });
        return { ...m, materiasCorrelativas: correl };
      })
    );
    db.close();
    res.json(materias); // Devuelve la lista de materias con correlativas
  } catch (err) {
    next(err); // Si algo sale mal, pasa el error al ayudante de errores
  }
});

module.exports = router; // Exporta el router para que se use en el servidor
