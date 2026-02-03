
const Categoria = require('../models/categoria');
const SubCategoria = require('../models/subcategory_model');
const { Op } = require("sequelize");

exports.getAllCategoriasWithSub = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      if (!isNaN(search) && search.trim() !== '') {
        whereClause = { id_categoria: search };
      } else {
        whereClause = {
          nombre_categoria: { [Op.like]: `%${search}%` }
        };
      }
    }

    const categorias = await Categoria.findAll({
      where: whereClause,
      include: [{
        model: SubCategoria,
        as: 'SubCategorias',
        attributes: ['id_subCategoria', 'nombre']
      }]
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías', details: error.message });
  }
};


exports.createCategoria = async (req, res) => {
  try {
    const newCategoria = await Categoria.create(req.body);
    res.status(201).json(newCategoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la categoría', details: error.message });
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const [updated] = await Categoria.update(req.body, {
      where: { id_categoria: req.params.id }
    });
    if (updated) {
      const updatedCategoria = await Categoria.findByPk(req.params.id);
      return res.status(200).json(updatedCategoria);
    }
    return res.status(404).json({ message: 'Categoría no encontrada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la categoría', details: error.message });
  }
};

exports.createSubCategoria = async (req, res) => {
  try {
    const newSubCategoria = await SubCategoria.create(req.body);
    res.status(201).json(newSubCategoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la subcategoría', details: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id_categoria } = req.params;

    const category = await Categoria.findByPk(id_categoria, {
      include: [{
        model: SubCategoria,
        as: 'SubCategorias',
        attributes: ['id_SubCategoria', 'nombre', 'id_categoria']
      }]
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(category);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la categoría', details: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Categoria.destroy({
      where: { id_categoria: id }
    });

    if (deleted) {
      return res.status(204).json({ message: 'Categoría eliminada exitosamente' });
    }
    return res.status(404).json({ message: 'Categoría no encontrada para eliminar' });

  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        error: 'Conflicto de Datos',
        details: 'No se puede eliminar la categoría porque tiene subcategorías' +
          ' o productos asociados. Elimine las dependencias primero.'
      });
    }

    res.status(500).json({ error: 'Error al eliminar la categoría', details: error.message });
  }
};
