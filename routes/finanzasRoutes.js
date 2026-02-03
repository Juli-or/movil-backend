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

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reportes y estadísticas financieras
 */

// Rutas protegidas

/**
 * @swagger
 * /api/finanzas:
 *   get:
 *     summary: Obtener datos financieros generales (Usuario)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen financiero
 */
router.get("/", verificarToken, getDatosFinancieros);

/**
 * @swagger
 * /api/finanzas/ventas-por-mes:
 *   get:
 *     summary: Obtener estadísticas de ventas por mes
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de ventas
 */
router.get("/ventas-por-mes", verificarToken, getVentasPorMes);

/**
 * @swagger
 * /api/finanzas/productos-mas-vendidos:
 *   get:
 *     summary: Top productos más vendidos
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/productos-mas-vendidos", verificarToken, getProductosMasVendidos);

/**
 * @swagger
 * /api/finanzas/ordenes-estado:
 *   get:
 *     summary: Conteo de órdenes por estado
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de órdenes
 */
router.get("/ordenes-estado", verificarToken, getOrdenesEstado);

// Rutas de reportes (soportan ?format=pdf|excel|html ó ?preview=1)

/**
 * @swagger
 * /api/finanzas/reportes/productos:
 *   get:
 *     summary: Generar reporte de productos
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *         description: Formato de salida del reporte
 *     responses:
 *       200:
 *         description: Archivo de reporte
 */
router.get('/reportes/productos', verificarToken, reportProductos);

/**
 * @swagger
 * /api/finanzas/reportes/inventario:
 *   get:
 *     summary: Generar reporte de inventario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte de inventario
 */
router.get('/reportes/inventario', verificarToken, reportInventario);

/**
 * @swagger
 * /api/finanzas/reportes/pedidos:
 *   get:
 *     summary: Generar reporte de pedidos
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte de pedidos
 */
router.get('/reportes/pedidos', verificarToken, reportPedidos);

/**
 * @swagger
 * /api/finanzas/reportes/descuentos:
 *   get:
 *     summary: Generar reporte de descuentos
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte de descuentos
 */
router.get('/reportes/descuentos', verificarToken, reportDescuentos);

// ==========================================
// 🛡️ RUTAS ADMIN (GLOBALES)
// ==========================================
const {
  getDatosFinancierosAdmin,
  getVentasPorMesAdmin,
  getProductosMasVendidosAdmin,
  getOrdenesEstadoAdmin,
  reportProductosAdmin,
  reportInventarioAdmin,
  reportPedidosAdmin,
  reportDescuentosAdmin
} = require("../controllers/finanzasController");

// Dashboard Admin Stats
/**
 * @swagger
 * /api/finanzas/admin/stats:
 *   get:
 *     summary: Estadísticas financieras globales (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 */
router.get("/admin/stats", verificarToken, getDatosFinancierosAdmin);

/**
 * @swagger
 * /api/finanzas/admin/ventas-por-mes:
 *   get:
 *     summary: Ventas por mes globales (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 */
router.get("/admin/ventas-por-mes", verificarToken, getVentasPorMesAdmin);

/**
 * @swagger
 * /api/finanzas/admin/productos-mas-vendidos:
 *   get:
 *     summary: Top productos globales (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/admin/productos-mas-vendidos", verificarToken, getProductosMasVendidosAdmin);

/**
 * @swagger
 * /api/finanzas/admin/ordenes-estado:
 *   get:
 *     summary: Estado de órdenes globales (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 */
router.get("/admin/ordenes-estado", verificarToken, getOrdenesEstadoAdmin);

// Reportes Admin Globales
/**
 * @swagger
 * /api/finanzas/admin/reportes/productos:
 *   get:
 *     summary: Reporte global de productos (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte generado
 */
router.get('/admin/reportes/productos', verificarToken, reportProductosAdmin);

/**
 * @swagger
 * /api/finanzas/admin/reportes/inventario:
 *   get:
 *     summary: Reporte global de inventario (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte generado
 */
router.get('/admin/reportes/inventario', verificarToken, reportInventarioAdmin);

/**
 * @swagger
 * /api/finanzas/admin/reportes/pedidos:
 *   get:
 *     summary: Reporte global de pedidos (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte generado
 */
router.get('/admin/reportes/pedidos', verificarToken, reportPedidosAdmin);

/**
 * @swagger
 * /api/finanzas/admin/reportes/descuentos:
 *   get:
 *     summary: Reporte global de descuentos (Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, html]
 *     responses:
 *       200:
 *         description: Reporte generado
 */
router.get('/admin/reportes/descuentos', verificarToken, reportDescuentosAdmin);

module.exports = router;
