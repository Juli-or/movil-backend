const express = require("express");
const router = express.Router();

const ofertasController = require("../controllers/ofertas_controller");

/* ======================================================
   RUTAS DE OFERTAS (CLIENTE)
====================================================== */

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Gestión de ofertas y descuentos para clientes
 */

/**
 * @swagger
 * /api/ofertas/codigos:
 *   get:
 *     summary: Listar todos los códigos de descuento disponibles
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: Lista de códigos de descuento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 codigos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       codigo:
 *                         type: string
 *                       valor_formateado:
 *                         type: string
 *                       dias_restantes:
 *                         type: integer
 */
// Obtener todos los códigos de descuento
router.get("/codigos", (req, res) => {
    ofertasController.listarCodigos(req, res);
});

/**
 * @swagger
 * /api/ofertas/validar/{codigo}:
 *   get:
 *     summary: Validar un código de descuento u oferta
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valido:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
// Validar un código por URL: /api/ofertas/validar/BLACK30
router.get("/validar/:codigo", (req, res) => {
    ofertasController.validarCodigo(req, res);
});

/**
 * @swagger
 * /api/ofertas/productos:
 *   get:
 *     summary: Listar productos que tienen ofertas o descuentos activos
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: Lista de productos en oferta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 productos:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Product'
 *                       - type: object
 *                         properties:
 *                           precio_final:
 *                             type: number
 *                           descuento_info:
 *                             type: string
 */
// Listar productos que tengan descuento u oferta
router.get("/productos", (req, res) => {
    ofertasController.productosEnOferta(req, res);
});

module.exports = router;
