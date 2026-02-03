const express = require("express");
const router = express.Router();
const { authenticateToken, isAgricultor, isAdmin } = require("../middleware/authMiddleware");
const ordenesController = require("../controllers/ordenController");

// Rutas protegidas
router.use(authenticateToken);

// Ruta para administradores (ver todas las órdenes)
// Nota: Colocar antes de rutas dinámicas si hay conflictos, aunque aquí /productor es estática y /:id es dinámica.
router.get("/admin/todas", isAdmin, ordenesController.obtenerTodasLasOrdenes);

// Ruta para agricultores (ver sus órdenes)
// Se mantiene isAgricultor aquí para esta ruta específica si se desea restringir
router.get("/productor", isAgricultor, ordenesController.obtenerOrdenes);

// Rutas compartidas o específicas
router.get("/:id/comprobante", ordenesController.generarComprobante);
router.put("/:id/estado", ordenesController.actualizarEstadoOrden);

module.exports = router;
