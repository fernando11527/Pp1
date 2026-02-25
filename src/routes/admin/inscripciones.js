const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/InscripcionAdminController");

router.get("/", controller.listar);
router.post("/", controller.crear);
router.get("/:id", controller.obtener);
router.post("/:id/materias", controller.agregarMateria);
router.delete("/:id/materias/:materiaId", controller.quitarMateria);
router.delete("/:id", controller.eliminar);

module.exports = router;
