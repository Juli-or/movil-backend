// controllers/productoDescuentoController.js
const ProductoDescuento = require('../models/producto_descuento');
const Product = require('../models/product');
const Descuento = require('../models/descuento');

// 1. ASIGNAR un Descuento a un Producto (Crear asignación)
exports.assignDescuentoToProduct = async (req, res) => {
  try {
    const { id_producto, id_descuento } = req.body;

    // Opcional: Verificar que ambos IDs existan (Buena práctica)
    if (!await Product.findByPk(id_producto) || !await Descuento.findByPk(id_descuento)) {
        return res.status(404).json({ message: 'Producto o Descuento no encontrado.' });
    }

    const newAssignment = await ProductoDescuento.create({ id_producto, id_descuento });

    res.status(201).json({ 
        message: 'Descuento asignado correctamente.',
        assignment: newAssignment 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Este descuento ya está asignado a este producto.' });
    }
    res.status(500).json({ error: 'Error al asignar el descuento.', details: error.message });
  }
};

exports.getAsignaciones = async (req, res) => {
  try {

    const asignaciones = await ProductoDescuento.findAll({ 
      include: [Descuento, Product], 
    });
    res.json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las asignaciones.', details: error.message });
  }
};

exports.unassignDescuentoFromProduct = async (req, res) => {
  try {
    const { id_producto, id_descuento } = req.params;

    const deleted = await ProductoDescuento.destroy({
      where: { id_producto, id_descuento }
    });

    if (deleted) {
      return res.status(204).json({ message: 'Asignación eliminada correctamente.' });
    }
    
    return res.status(404).json({ message: 'Asignación no encontrada.' });

  } catch (error) {
    res.status(500).json({ error: 'Error al desasignar el descuento.', details: error.message });
  }
};