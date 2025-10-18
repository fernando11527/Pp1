const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/CarreraAdminController");

router.get("/", controller.listar);
router.post("/", controller.crear);
router.get("/:id", controller.obtener);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);
router.post("/:id/materias", controller.asignarMaterias);

module.exports = router;
