const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/InscripcionAdminController");

router.get("/", controller.listar);
router.post("/", controller.crear);
router.get("/:id", controller.obtener);
router.delete("/:id", controller.eliminar);

module.exports = router;
