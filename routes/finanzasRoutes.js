const express = require("express");
const router = express.Router();
const { verificarToken } = require("../utils/jwt");
const {
 getDatosFinancieros,
 getVentasPorMes,
 getProductosMasVendidos,
 getOrdenesEstado,
	reportProductos,
	reportInventario,
	reportPedidos,
	 reportDescuentos,
} = require("../controllers/finanzasController");

// Rutas protegidas
router.get("/", verificarToken, getDatosFinancieros);
router.get("/ventas-por-mes", verificarToken, getVentasPorMes);
router.get("/productos-mas-vendidos", verificarToken, getProductosMasVendidos);
router.get("/ordenes-estado", verificarToken, getOrdenesEstado);

// Rutas de reportes (soportan ?format=pdf|excel|html ó ?preview=1)
router.get('/reportes/productos', verificarToken, reportProductos);
router.get('/reportes/inventario', verificarToken, reportInventario);
router.get('/reportes/pedidos', verificarToken, reportPedidos);
router.get('/reportes/descuentos', verificarToken, reportDescuentos);

module.exports = router;