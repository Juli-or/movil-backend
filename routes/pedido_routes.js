const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedido_controller');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestión de pedidos
 */

/**
 * @swagger
 * /api/pedidos/crear:
 *   post:
 *     summary: Crear un nuevo pedido a partir del carrito activo
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - id_metodo_pago
 *               - direccion_envio
 *               - ciudad_envio
 *               - total_pedido
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               id_metodo_pago:
 *                 type: integer
 *               direccion_envio:
 *                 type: string
 *               ciudad_envio:
 *                 type: string
 *               codigo_postal_envio:
 *                 type: string
 *               notas_pedido:
 *                 type: string
 *               total_pedido:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pedido creado exitosamente
 */
router.post('/crear', pedidosController.crearPedido);

/**
 * @swagger
 * /api/pedidos/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener historial de pedidos de un usuario
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/usuario/:id_usuario', pedidosController.obtenerPedidosUsuario);

/**
 * @swagger
 * /api/pedidos/{id_pedido}:
 *   get:
 *     summary: Obtener detalle de un pedido específico
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id_pedido
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del pedido
 */
router.get('/:id_pedido', pedidosController.obtenerDetallePedido);

/**
 * @swagger
 * /api/pedidos/cancelar/{id_pedido}:
 *   put:
 *     summary: Cancelar un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id_pedido
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo_cancelacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pedido cancelado
 */
router.put('/cancelar/:id_pedido', pedidosController.cancelarPedido);

module.exports = router;
