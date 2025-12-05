
const Rol = require('../models/rol');

exports.createRol = async (req, res) => {
   
    const newRolData = req.body; 
    try {  
        const rol = await Rol.create(newRolData);   
        res.status(201).json(rol);        
    } catch (error) {   
        console.error('Error al crear el rol:', error);      
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                message: 'El nombre de este rol ya existe. Por favor, elija un nombre diferente.', 
                details: error.errors.map(err => err.message)
            });
          }  
      
        if (error.name === 'SequelizeValidationError') {        
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ 
                message: 'Error de validación: Datos de rol incompletos o incorrectos.', 
                details: validationErrors 
            });
        }    
        res.status(500).json({ 
            message: 'Error interno del servidor al crear el rol.', 
            details: error.message 
        });
    }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRol = async (req, res) => {
  try {
    const [updated] = await Rol.update(req.body, {
      where: { id_rol: req.params.id_rol }
    });
    
    if (updated) {
      const updatedRol = await Rol.findByPk(req.params.id);
      return res.status(200).json(updatedRol);
    }
    
    return res.status(404).json({ message: 'Rol no encontrado para actualizar' });

  } catch (error) {
    
    
    res.status(500).json({ error: 'Error al actualizar el rol', details: error.message });
  }
};


exports.deleteRol = async (req, res) => {
    try {
        const deleted = await Rol.destroy({
            where: { id_rol: req.params.id_rol }
        });
        if (deleted) {
            return res.status(204).json({ message: 'Rol eliminado' });
        }
        return res.status(404).json({ message: 'Rol no encontrado para eliminar' });
    } catch (error) {
        // El error puede ser debido a restricción de clave foránea
        res.status(500).json({ error: 'Error al eliminar el rol', details: error.message });
    }
};

// 5. Obtener Rol por ID (Admin)
exports.getRolById = async (req, res) => {
  try {
    const { id_rol } = req.params;

    const rol = await Rol.findByPk(id_rol);

    if (!rol) {
      return res.status(404).json({ error:'Rol no encontrado' });
    }

    res.json(rol);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el rol', details: error.message });
  }
};