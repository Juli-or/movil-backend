// routes/tipoPqrsRoutes.js
const express = require('express');
const router = express.Router();
const tipoPqrsController = require('../controllers/tipoPqrsController');
const adminMiddleware = require('../middleware/adminMiddleware'); 

/**
 * @swagger
 * tags:
 *   name: PqrsTypes
 *   description: Gestión de tipos de PQRS (Admin)
 */

/**
 * @swagger
 * /api/tipoPqrs/admin:
 *   get:
 *     summary: Listar todos los tipos de PQRS
 *     tags: [PqrsTypes]
 *     responses:
 *       200:
 *         description: Lista de tipos de PQRS
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoPQRS'
 */
router.get('/admin', tipoPqrsController.getAllTipos); 

/**
 * @swagger
 * /api/tipoPqrs/admin/{id_tipo_pqrs}:
 *   get:
 *     summary: Obtener un tipo de PQRS por ID
 *     tags: [PqrsTypes]
 *     parameters:
 *       - in: path
 *         name: id_tipo_pqrs
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del tipo de PQRS
 */
router.get('/admin/:id_tipo_pqrs', tipoPqrsController.getTipoById); 

// Rutas de ADMINISTRACIÓN

/**
 * @swagger
 * /api/tipoPqrs/admin/create:
 *   post:
 *     summary: Crear un nuevo tipo de PQRS
 *     tags: [PqrsTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoPQRS'
 *     responses:
 *       201:
 *         description: Tipo de PQRS creado
 */
router.post('/admin/create', tipoPqrsController.createTipo);

/**
 * @swagger
 * /api/tipoPqrs/admin/update/{id}:
 *   put:
 *     summary: Actualizar un tipo de PQRS
 *     tags: [PqrsTypes]
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
 *             $ref: '#/components/schemas/TipoPQRS'
 *     responses:
 *       200:
 *         description: Tipo de PQRS actualizado
 */
router.put('/admin/update/:id',  tipoPqrsController.updateTipo);

/**
 * @swagger
 * /api/tipoPqrs/admin/delete/{id}:
 *   delete:
 *     summary: Eliminar un tipo de PQRS
 *     tags: [PqrsTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de PQRS eliminado
 */
router.delete('/admin/delete/:id',  tipoPqrsController.deleteTipo);

module.exports = router;
