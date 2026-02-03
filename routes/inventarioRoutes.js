const express = require("express");
const router = express.Router();
const inventarioController = require("../controllers/inventarioController");

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Gestión de inventarios de productos
 */

/**
 * @swagger
 * /api/inventarios:
 *   get:
 *     summary: Listar todo el inventario
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Lista de inventarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 */
// GET /api/inventarios
router.get("/", inventarioController.getAllInventario);

/**
 * @swagger
 * /api/inventarios/{id}:
 *   get:
 *     summary: Obtener inventario por ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del inventario
 *       404:
 *         description: Inventario no encontrado
 */
router.get("/:id", inventarioController.getInventarioById);

/**
 * @swagger
 * /api/inventarios:
 *   post:
 *     summary: Crear nuevo registro de inventario
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventario'
 *     responses:
 *       201:
 *         description: Inventario creado
 */
router.post("/", inventarioController.createInventario);

/**
 * @swagger
 * /api/inventarios/{id}:
 *   put:
 *     summary: Actualizar inventario
 *     tags: [Inventory]
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
 *             $ref: '#/components/schemas/Inventario'
 *     responses:
 *       200:
 *         description: Inventario actualizado
 */
router.put("/:id", inventarioController.updateInventario);

/**
 * @swagger
 * /api/inventarios/{id}:
 *   delete:
 *     summary: Eliminar registro de inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventario eliminado
 */
router.delete("/:id", inventarioController.deleteInventario);

module.exports = router;
