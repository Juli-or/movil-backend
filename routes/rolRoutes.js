// routes/rolRoutes.js
const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Ruta para crear un nuevo rol (solo para administradores)
router.post('/admin/create', rolController.createRol);
router.put('/admin/update/:id_rol', rolController.updateRol);
router.delete('/admin/delete/:id_rol', rolController.deleteRol);
router.get('/admin', rolController.getAllRoles);
router.get('/admin/:id_rol', rolController.getRolById);
module.exports = router;