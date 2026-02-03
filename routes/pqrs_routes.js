const express = require("express");
const router = express.Router();
const pqrsController = require("../controllers/pqrs_controller");

/**
 * @swagger
 * tags:
 *   name: PQRS
 *   description: Peticiones, Quejas, Reclamos y Sugerencias
 */

/**
 * @swagger
 * /api/pqrs:
 *   post:
 *     summary: Crear una nueva PQRS
 *     tags: [PQRS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pqrs'
 *     responses:
 *       201:
 *         description: PQRS creada exitosamente
 */
router.post("/", pqrsController.createPqrs); 

/**
 * @swagger
 * /api/pqrs/my-pqrs/{id_usuario}:
 *   get:
 *     summary: Obtener PQRS de un usuario específico
 *     tags: [PQRS]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de PQRS del usuario
 */
router.get("/my-pqrs/:id_usuario", pqrsController.getMyPqrs); 

/**
 * @swagger
 * /api/pqrs/{id_pqrs}:
 *   get:
 *     summary: Obtener detalle de una PQRS
 *     tags: [PQRS]
 *     parameters:
 *       - in: path
 *         name: id_pqrs
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la PQRS
 *       404:
 *         description: PQRS no encontrada
 */
router.get("/:id_pqrs", pqrsController.getPqrsById);

/**
 * @swagger
 * /api/pqrs:
 *   get:
 *     summary: Listar todas las PQRS (Admin)
 *     tags: [PQRS]
 *     responses:
 *       200:
 *         description: Lista de todas las PQRS
 */
router.get("/", pqrsController.getAllPqrs);

/**
 * @swagger
 * /api/pqrs/{id_pqrs}:
 *   put:
 *     summary: Actualizar estado o respuesta de PQRS (Admin)
 *     tags: [PQRS]
 *     parameters:
 *       - in: path
 *         name: id_pqrs
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estado_pqrs:
 *                 type: integer
 *               respuesta_administrador:
 *                 type: string
 *               id_administrador_respuesta:
 *                 type: integer
 *     responses:
 *       200:
 *         description: PQRS actualizada
 */
router.put("/:id_pqrs", pqrsController.updatePqrsStatus);

module.exports = router;
