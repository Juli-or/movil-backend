const express = require('express');
const router = express.Router();
const estadoPqrsController = require('../controllers/estadoPqrsController');
const adminMiddleware = require('../middleware/adminMiddleware')

// Rutas de ADMINISTRACIÓN 
router.post('/create',  estadoPqrsController.createEstado); 
router.put('/update/:id',  estadoPqrsController.updateEstado); 
router.delete('/delete/:id', estadoPqrsController.deleteEstado); 
router.get('/admin', estadoPqrsController.getAllEstados); 
router.get('/:id', estadoPqrsController.getEstadoById); 

module.exports = router;