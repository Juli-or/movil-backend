const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const productorController = require('../controllers/productorController');

router.use(authenticateToken);

router.post('/', productorController.createProducto);
router.get('/usuario/:id_usuario', productorController.getProductosByUserId);
router.put('/:id', productorController.updateProducto);
router.put('/desactivar/:id', productorController.deactivateProducto);

module.exports = router;