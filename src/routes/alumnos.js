// Este archivo define las rutas para consultar datos de alumnos
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const AlumnoController = require("../controllers/AlumnoController"); // logica para alumnos

// Ruta para buscar un alumno por DNI
router.post("/buscar-dni", AlumnoController.buscarPorDni);

// Ruta para consultar las materias posibles para un alumno
router.get(":alumnoId/materias-posibles", AlumnoController.materiasPosibles);

module.exports = router; // Exporta el router para que se use en el servidor
