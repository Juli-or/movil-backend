const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const productorController = require('../controllers/productorController');

/**
 * @swagger
 * tags:
 *   name: Producer
 *   description: Gestión de productos por parte del productor
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/productor:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Producer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', productorController.createProducto);

/**
 * @swagger
 * /api/productor/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener productos de un productor
 *     tags: [Producer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos del productor
 */
router.get('/usuario/:id_usuario', productorController.getProductosByUserId);

/**
 * @swagger
 * /api/productor/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Producer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/:id', productorController.updateProducto);

/**
 * @swagger
 * /api/productor/desactivar/{id}:
 *   put:
 *     summary: Desactivar un producto
 *     tags: [Producer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto desactivado
 */
router.put('/desactivar/:id', productorController.deactivateProducto);

/**
 * @swagger
 * /api/productor/{id}:
 *   delete:
 *     summary: Eliminar un producto (físicamente)
 *     tags: [Producer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete('/:id', productorController.deleteProducto);

module.exports = router;
