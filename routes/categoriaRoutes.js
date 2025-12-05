// routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const adminMiddleware = require('../middleware/adminMiddleware'); 

// Rutas de ADMINISTRACIÓN (CRUD) de Categorías
router.post('/admin/create',  categoriaController.createCategoria);
router.put('/admin/update/:id', categoriaController.updateCategoria);
router.delete('/admin/delete/:id', categoriaController.deleteCategory);
router.post('/admin/crearSubcategoria',categoriaController.createSubCategoria);
router.get('/admin', categoriaController.getAllCategoriasWithSub); 
router.get('/admin/:id_categoria', categoriaController.getCategoryById);
module.exports = router;