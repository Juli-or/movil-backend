const express = require("express");
const router = express.Router();
const Inventario = require("../models/inventario");
const Producto = require("../models/producto_model");
const User = require("../models/user_model");

// GET /api/inventarios - Obtener todo el inventario
router.get("/", async (req, res) => {
  try {
    const inventarios = await Inventario.findAll({
      include: [{
        model: Producto,
        as: 'producto',
        include: [{
          model: User,
          as: 'agricultor',
          attributes: ['id_usuario', 'nombre_usuario']
        }]
      }]
    });
    res.json(inventarios);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
});

// Puedes agregar POST, PUT, DELETE aquí si lo necesitas

module.exports = router;
