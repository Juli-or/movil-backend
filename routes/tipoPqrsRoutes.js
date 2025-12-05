// routes/tipoPqrsRoutes.js
const express = require('express');
const router = express.Router();
const tipoPqrsController = require('../controllers/tipoPqrsController');
const adminMiddleware = require('../middleware/adminMiddleware'); 
router.get('/admin', tipoPqrsController.getAllTipos); 
router.get('/admin/:id_tipo_pqrs', tipoPqrsController.getTipoById); 

// Rutas de ADMINISTRACIÓN
router.post('/admin/create', tipoPqrsController.createTipo);
router.put('/admin/update/:id',  tipoPqrsController.updateTipo);
router.delete('/admin/delete/:id',  tipoPqrsController.deleteTipo);

module.exports = router;