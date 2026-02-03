// routes/rolRoutes.js
const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de Roles de usuario
 */

/**
 * @swagger
 * /api/roles/admin/create:
 *   post:
 *     summary: Crear un nuevo rol (Admin)
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rol'
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 */
// Ruta para crear un nuevo rol (solo para administradores)
router.post('/admin/create', rolController.createRol);

/**
 * @swagger
 * /api/roles/admin/update/{id_rol}:
 *   put:
 *     summary: Actualizar un rol (Admin)
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id_rol
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rol'
 *     responses:
 *       200:
 *         description: Rol actualizado
 */
router.put('/admin/update/:id_rol', rolController.updateRol);

/**
 * @swagger
 * /api/roles/admin/delete/{id_rol}:
 *   delete:
 *     summary: Eliminar un rol (Admin)
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id_rol
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rol eliminado
 */
router.delete('/admin/delete/:id_rol', rolController.deleteRol);

/**
 * @swagger
 * /api/roles/admin:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rol'
 */
router.get('/admin', rolController.getAllRoles);

/**
 * @swagger
 * /api/roles/admin/{id_rol}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id_rol
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del rol
 */
router.get('/admin/:id_rol', rolController.getRolById);

module.exports = router;
