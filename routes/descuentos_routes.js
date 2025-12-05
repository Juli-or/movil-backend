const express = require("express");
const router = express.Router();

const descuentosController = require("../controllers/descuentos_controller");

router.get("/activos", descuentosController.getDescuentosActivos);
router.post("/validar", descuentosController.validarCodigo);

module.exports = router;