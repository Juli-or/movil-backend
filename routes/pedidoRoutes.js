// routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const adminMiddleware = require('../middleware/adminMiddleware'); 
const estadoPedidoController = require('../controllers/estadoPedidoController')

// Rutas de ADMINISTRACIÓN de Pedidos 
router.get('/admin', pedidoController.getAllPedidosAdmin); 
router.get('/admin/:id',  pedidoController.getPedidoByIdAdmin);
router.put('/admin/orders/estado/:id', estadoPedidoController.updateEstadoPedido);
router.put('/admin/estadoPedido/:id', estadoPedidoController.updateEstadoPedido); 

module.exports = router;