// routes/productoDescuentoRoutes.js
const express = require('express');
const router = express.Router();
const pdController = require('../controllers/productoDescuentoController');
const adminMiddleware = require('../middleware/adminMiddleware'); 


router.post('/admin/assign',  pdController.assignDescuentoToProduct);
router.get('/admin/:id_producto', pdController.getAsignaciones);
router.delete('/admin/unassign/:id_producto/:id_descuento', pdController.unassignDescuentoFromProduct);

module.exports = router;
