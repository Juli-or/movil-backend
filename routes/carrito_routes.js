const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito_controller');




router.get('/numero-items/:id_usuario', carritoController.getCartItemsCount);


router.get('/activo/:id_usuario', carritoController.getActiveCart);


router.get('/resumen/:id_carrito', carritoController.getCartSummary);




router.post('/agregar', carritoController.addToCart);




router.put('/actualizar-item/:id_item', carritoController.updateCartItem);


router.delete('/eliminar-item/:id_item', carritoController.deleteCartItem);


router.delete('/vaciar/:id_carrito', carritoController.clearCart);

module.exports = router;