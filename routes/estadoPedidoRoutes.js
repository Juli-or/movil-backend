
const express = require('express');
const router = express.Router();
const estadoPedidoController = require('../controllers/estadoPedidoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


router.post('/admin/create',  estadoPedidoController.createEstadoPedido);
router.get('/admin', estadoPedidoController.getAllEstadoPedidos);

module.exports = router;