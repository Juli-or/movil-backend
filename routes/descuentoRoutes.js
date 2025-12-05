const express = require('express');
const router = express.Router();
const descuentoController = require('../controllers/descuentoController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rutas de administración de Descuentos 
router.post('/create',  descuentoController.createDescuento);
router.get('/admin',  descuentoController.getAllDescuentos);
router.get('/:id',  descuentoController.getDescuentoById);
router.put('/update/:id',  descuentoController.updateDescuento);
router.delete('/delete/:id',  descuentoController.deleteDescuento);

module.exports = router;