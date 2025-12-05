const Descuento = require('../models/descuento');

// 1. Crear Nuevo Descuento
exports.createDescuento = async (req, res) => {
  try {
    const nuevoDescuento = await Descuento.create(req.body);
    res.status(201).json(nuevoDescuento);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el descuento', details: error.message });
  }
};

// 2. Obtener Todos los Descuentos
exports.getAllDescuentos = async (req, res) => {
  try {
    const descuentos = await Descuento.findAll();
    res.json(descuentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los descuentos', details: error.message });
  }
};

// 3. Obtener Descuento por ID
exports.getDescuentoById = async (req, res) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) {
      return res.status(404).json({ message: 'Descuento no encontrado' });
    }
    res.json(descuento);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el descuento', details: error.message });
  }
};

// 4. Actualizar Descuento
exports.updateDescuento = async (req, res) => {
  try {
    const [updated] = await Descuento.update(req.body, {
      where: { id_descuento: req.params.id }
    });
    if (updated) {
      const updatedDescuento = await Descuento.findByPk(req.params.id);
      return res.status(200).json(updatedDescuento);
    }
    throw new Error('Descuento no encontrado para actualizar');
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el descuento', details: error.message });
  }
};

// 5. Eliminar Descuento
exports.deleteDescuento = async (req, res) => {
  try {
    const deleted = await Descuento.destroy({
      where: { id_descuento: req.params.id }
    });
    if (deleted) {
      return res.status(204).json({ message: 'Descuento eliminado' });
    }
    throw new Error('Descuento no encontrado para eliminar');
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el descuento', details: error.message });
  }
};