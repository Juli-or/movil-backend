const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito_controller');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Gestión del carrito de compras
 */

/**
 * @swagger
 * /api/carrito/numero-items/{id_usuario}:
 *   get:
 *     summary: Obtener número total de items en el carrito
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conteo de items
 */
router.get('/numero-items/:id_usuario', carritoController.getCartItemsCount);

/**
 * @swagger
 * /api/carrito/activo/{id_usuario}:
 *   get:
 *     summary: Obtener el carrito activo de un usuario
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Carrito activo con sus items
 */
router.get('/activo/:id_usuario', carritoController.getActiveCart);

/**
 * @swagger
 * /api/carrito/resumen/{id_carrito}:
 *   get:
 *     summary: Obtener resumen del carrito (subtotal, cantidad items)
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_carrito
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resumen del carrito
 */
router.get('/resumen/:id_carrito', carritoController.getCartSummary);


/**
 * @swagger
 * /api/carrito/agregar:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - id_producto
 *               - cantidad
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               id_producto:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto agregado correctamente
 */
router.post('/agregar', carritoController.addToCart);


/**
 * @swagger
 * /api/carrito/actualizar-item/{id_item}:
 *   put:
 *     summary: Actualizar cantidad de un item del carrito
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_item
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 */
router.put('/actualizar-item/:id_item', carritoController.updateCartItem);

/**
 * @swagger
 * /api/carrito/eliminar-item/{id_item}:
 *   delete:
 *     summary: Eliminar un item del carrito
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_item
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item eliminado
 */
router.delete('/eliminar-item/:id_item', carritoController.deleteCartItem);

/**
 * @swagger
 * /api/carrito/vaciar/{id_carrito}:
 *   delete:
 *     summary: Vaciar todo el carrito
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id_carrito
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Carrito vaciado
 */
router.delete('/vaciar/:id_carrito', carritoController.clearCart);

module.exports = router;
