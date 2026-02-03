const TipoPqrs = require('../models/tipo_pqrs_model');
const { Op } = require("sequelize");

exports.createTipo = async (req, res) => {
  try {
    const { nombre_tipo } = req.body;
    if (!nombre_tipo || typeof nombre_tipo !== 'string' || nombre_tipo.trim() === '') {
      return res.status(400).json({ 
        message: 'El campo "nombre_tipo" es obligatorio y no puede estar vacío.' 
      });
    }
    const newTipo = await TipoPqrs.create(req.body);
    res.status(201).json(newTipo);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Este nombre de tipo de PQRS ya existe.' });
    }
   
    res.status(500).json({ error: 'Error al crear el tipo de PQRS', details: error.message });
  }
};

exports.getAllTipos = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      if (!isNaN(search) && search.trim() !== '') {
        whereClause = { id_tipo_pqrs: search };
      } else {
        whereClause = {
          nombre_tipo: { [Op.like]: `%${search}%` }
        };
      }
    }

    const tipos = await TipoPqrs.findAll({
      where: whereClause,
      order: [['id_tipo_pqrs', 'ASC']]
    });
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los tipos de PQRS', details: error.message });
  }
};


exports.getTipoById = async (req, res) => {
  try {
    const tipo = await TipoPqrs.findByPk(req.params.id_tipo_pqrs);
    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de PQRS no encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el tipo', details: error.message });
  }
};


exports.updateTipo = async (req, res) => {
  try {
    const [updated] = await TipoPqrs.update(req.body, {
      where: { id_tipo_pqrs: req.params.id }
    });
    if (updated) {
      const updatedTipo = await TipoPqrs.findByPk(req.params.id);
      return res.status(200).json(updatedTipo);
    }
    return res.status(404).json({ message: 'Tipo de PQRS no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el tipo', details: error.message });
  }
};


exports.deleteTipo = async (req, res) => {
  try {
    const deleted = await TipoPqrs.destroy({
      where: { id_tipo_pqrs: req.params.id }
    });
    if (deleted) {
      return res.status(204).json({ message: 'Tipo de PQRS eliminado' });
    }
    return res.status(404).json({ message: 'Tipo de PQRS no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el tipo', details: error.message });
  }
};
