const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/CorrelativaAdminController");

router.get("/", controller.listar);
router.post("/", controller.crear);
router.delete("/", controller.eliminar);

module.exports = router;
