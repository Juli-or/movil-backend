// routes/tipoDescuentoRoutes.js
const express = require('express');
const router = express.Router();
const tipoDescuentoController = require('../controllers/tipoDescuentoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


router.post('/create', tipoDescuentoController.createTipoDescuento);
router.get('/ver', tipoDescuentoController.getAllTipoDescuentos);

module.exports = router;