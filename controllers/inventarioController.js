const Inventario = require("../models/inventario");
const Producto = require("../models/producto_model");
const User = require("../models/user_model");
const { Op } = require("sequelize");

exports.getAllInventario = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
        if (!isNaN(search) && search.trim() !== '') {
             whereClause = { id_inventario: search };
        } else {
            whereClause = {
                [Op.or]: [
                    { '$Producto.nombre_producto$': { [Op.like]: `%${search}%` } },
                    { '$Producto.Productor.nombre_usuario$': { [Op.like]: `%${search}%` } },
                    { ubicacion_almacenamiento: { [Op.like]: `%${search}%` } }
                ]
            };
        }
    }

    const inventarios = await Inventario.findAll({
      where: whereClause,
      include: [{
        model: Producto,
        as: 'Producto', 
        include: [{
          model: User,
          as: 'Productor', 
          attributes: ['id_usuario', 'nombre_usuario']
        }]
      }]
    });
    res.json(inventarios);
  } catch (err) {
    console.error("Error obteniendo inventario:", err);
    res.status(500).json({ error: "Error al obtener inventario", details: err.message });
  }
};

exports.getInventarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventario.findByPk(id, {
      include: [{
        model: Producto,
        as: 'Producto',
        include: [{
          model: User,
          as: 'Productor',
          attributes: ['id_usuario', 'nombre_usuario']
        }]
      }]
    });

    if (!item) {
      return res.status(404).json({ message: "Item de inventario no encontrado" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el item", details: err.message });
  }
};

exports.createInventario = async (req, res) => {
  try {
    const { id_producto, id_agricultor, cantidad_disponible, ubicacion_almacenamiento } = req.body;

    if (!id_producto || cantidad_disponible === undefined) {
      return res.status(400).json({ message: "ID de producto y cantidad son obligatorios." });
    }

    const nuevoInventario = await Inventario.create({
      id_producto,
      id_agricultor,
      cantidad_disponible,
      ubicacion_almacenamiento,
      fecha_ultima_actualizacion: new Date()
    });

    res.status(201).json({
      message: "Inventario registrado exitosamente",
      inventario: nuevoInventario
    });

  } catch (err) {
    console.error("Error creando inventario:", err);
    res.status(500).json({ error: "Error al registrar inventario", details: err.message });
  }
};

exports.updateInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_disponible, ubicacion_almacenamiento } = req.body;

    const item = await Inventario.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    await item.update({
      cantidad_disponible,
      ubicacion_almacenamiento,
      fecha_ultima_actualizacion: new Date()
    });

    res.json({
      message: "Inventario actualizado correctamente",
      inventario: item
    });

  } catch (err) {
    res.status(500).json({ error: "Error al actualizar inventario", details: err.message });
  }
};

exports.deleteInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Inventario.destroy({ where: { id_inventario: id } });
    
    if (!eliminado) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    res.json({ message: "Registro de inventario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar inventario", details: err.message });
  }
};
