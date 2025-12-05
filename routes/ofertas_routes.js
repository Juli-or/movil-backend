const express = require("express");
const router = express.Router();
const controller = require("../controllers/ofertas_controller");
router.get("/", controller.getOfertasActivas);
router.post("/validar-codigo", controller.validarCodigo); 

module.exports = router;