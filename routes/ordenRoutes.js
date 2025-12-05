const express = require("express");
const router = express.Router();
const { authenticateToken, isAgricultor } = require("../middleware/authMiddleware");
const ordenesController = require("../controllers/ordenController");

router.use(authenticateToken);
router.use(isAgricultor);

router.get("/productor", ordenesController.obtenerOrdenes);
router.get("/:id/comprobante", ordenesController.generarComprobante);
router.put("/:id/estado", ordenesController.actualizarEstadoOrden);

module.exports = router;