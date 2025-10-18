// Este archivo define la ruta para generar resumen diario manualmente (solo para testing)
// "Ruta" significa el camino por donde llegan los pedidos del usuario
const express = require("express");
const router = express.Router();
const ResumenDiarioServicio = require("../../servicios/ResumenDiarioServicio");

const resumenServicio = new ResumenDiarioServicio();

// Ruta para generar resumen diario manualmente (para probar)
router.get("/", async (req, res, next) => {
  try {
    const resumen = await resumenServicio.enviarResumenDiario();
    res.json({
      mensaje: "Resumen generado y enviado correctamente",
      resumen,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
