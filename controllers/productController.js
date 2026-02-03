const Product = require('../models/producto_model');
const SubCategoria = require('../models/subcategory_model');
const User = require('../models/user_model');
const Categoria = require('../models/categoria');
const Descuento = require('../models/descuento');
const { Op } = require("sequelize");

exports.getAllProductsAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      if (!isNaN(search) && search.trim() !== '') {
         whereClause = { id_producto: search };
      } else {
        whereClause = {
          [Op.or]: [
            { nombre_producto: { [Op.like]: `%${search}%` } },
            { descripcion_producto: { [Op.like]: `%${search}%` } },
            { unidad_medida: { [Op.like]: `%${search}%` } },
            { estado_producto: { [Op.like]: `%${search}%` } }
          ]
        };
      }
    }

    const products = await Product.findAll({
      where: whereClause,
      include:[
        { 
            model: SubCategoria, 
            as: 'SubCategoria',
            attributes: ['id_SubCategoria', 'nombre'] 
        }
      ],
      order: [['id_producto', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los productos', details: error.message });
  }
};

exports.updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productExists = await Product.findByPk(id);
    if (!productExists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const [updated] = await Product.update(req.body, {
      where: { id_producto: id }
    });
    
    const updatedProduct = await Product.findByPk(id);
    res.status(200).json(updatedProduct);

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const { estado } = req.body; 
    const validStates = ['Aprobado', 'Rechazado'];
    
    if (!validStates.includes(estado)) {
      return res.status(400).json({ message: 'Estado de aprobación inválido.' });
    }

    const [updated] = await Product.update({ estado_aprobacion: estado }, {
      where: { id_producto: req.params.id }
    });

    if (updated) {
      return res.status(200).json({ message: `Producto ${req.params.id} actualizado a estado: ${estado}` });
    }
    
    return res.status(404).json({ message: 'Producto no encontrado para actualizar.' });

  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el estado de aprobación', details: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: SubCategoria,
          as: 'SubCategoria',
          attributes: ['id_SubCategoria', 'nombre'],
          include: [{
            model: Categoria,
            as: 'Categoria',
            attributes: ['id_categoria', 'nombre_categoria']
          }]
        },
        {
          model: Descuento,
          through: { attributes: [] }, 
          attributes: ['id_descuento', 'nombre_descuento', 'valor_descuento', 'fecha_inicio', 'fecha_fin']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto', details: error.message });
  }
};

exports.deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    try {
      await Product.destroy({
        where: { id_producto: id }
      });
      return res.status(204).json({ message: 'Producto eliminado' });
    } catch (destroyError) {
      console.warn(`No se pudo eliminar físicamente el producto ${id}, cambiando a estado Inactivo. Error: ${destroyError.message}`);
      
      await Product.update(
        { estado_producto: 'Inactivo' },
        { where: { id_producto: id } }
      );
      
      return res.status(200).json({ 
        message: 'El producto tiene registros asociados. Se ha cambiado a estado "Inactivo" en lugar de eliminarlo.' 
      });
    }
    } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto', details: error.message });
  }
};

exports.deleteProductPermanent = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await Product.destroy({
      where: { id_producto: id }
    });
    
    return res.status(200).json({ message: 'Producto eliminado permanentemente de la base de datos.' });

  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        message: 'No se puede eliminar el producto porque tiene registros asociados (ventas, pedidos, etc.). Debes eliminar esos registros primero o archivar el producto.',
        error: 'Integrity Constraint Violation' 
      });
    }

    res.status(500).json({ 
      message: 'Error al eliminar el producto permanentemente.',
      error: error.message,
      details: error 
    });
  }
};

exports.createProductAdmin = async (req, res) => {
  try {
    const { 
      nombre_producto, 
      descripcion_producto, 
      precio_unitario,
      unidad_medida,      
      id_SubCategoria,
      cantidad,
      estado_producto,
      id_usuario,
      url_imagen
    } = req.body;

    if (!nombre_producto || !precio_unitario || !id_SubCategoria) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, precio, subcategoría o productor.' });
    }

    if (id_usuario) {
      const user = await User.findByPk(id_usuario);
      if (!user) {
        return res.status(400).json({ message: 'El ID de usuario proporcionado no existe.' });
      }
      if (user.id_rol !== 3) {
        return res.status(400).json({ message: 'El usuario proporcionado no tiene el rol de Agricultor (Rol 3).' });
      }
    }

    const newProduct = await Product.create({
      nombre_producto, 
      descripcion_producto, 
      precio_unitario,      
      unidad_medida,
      id_SubCategoria,
      cantidad,
      estado_producto: estado_producto || 'activo',
      id_usuario: id_usuario || null,
      url_imagen
    });

    res.status(201).json({ 
        message: 'Producto creado exitosamente.',
        product: newProduct 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message, details: error });
  }
};
