const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedido_controller');


router.post('/crear', pedidosController.crearPedido);


router.get('/usuario/:id_usuario', pedidosController.obtenerPedidosUsuario);


router.get('/:id_pedido', pedidosController.obtenerDetallePedido);


router.put('/cancelar/:id_pedido', pedidosController.cancelarPedido);

module.exports = router;