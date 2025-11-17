// Este archivo define las rutas para crear inscripciones
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const InscripcionController = require("../controllers/InscripcionController"); // logica para inscripciones

// Ruta para verificar si un alumno ya esta inscripto en un periodo
router.get("/verificar", InscripcionController.verificarInscripcion);

// Ruta para crear una inscripcion
router.post("/", InscripcionController.crear);

module.exports = router; // Exporta el router para que se use en el servidor
