
const Pqrs = require('../models/pqrs');
const User = require('../models/user');

const EstadoPqrs = require('../models/estadoPqrs'); 
const TipoPqrs = require ('../models/tipo_pqrs_model');


// 1. Crear Nueva PQRS
exports.createPqrs = async (req, res) => {
  try {
    // 1. Obtener datos y asegurar el ID de usuario del token
    const id_usuario = req.params.id_usuario; 
    const {id_tipo_pqrs, asunto, descripcion } = req.body;

    
    const newPqrsRecord = await Pqrs.create({
      id_usuario,
      id_tipo_pqrs,
      asunto,
      descripcion,
    });
    
   
    const newPqrsId = newPqrsRecord.id_pqrs;
    const newPqrs = await Pqrs.findByPk(newPqrsId, {
      include: [
        {
          model: User,
          as: 'Remitente', 
          attributes: ['id_usuario', 'nombre_usuario', 'correo_electronico']
        },
        // 2. Administrador de Respuesta
        {
          model: User,
          as: 'AdminRespuesta', 
          attributes: ['id_usuario']
        },
        // 3. Tipo de PQRS
        {
          model: TipoPqrs,
          as: 'Tipo', 
          attributes: ['id_tipo_pqrs', 'nombre_tipo'] 
        },
        // 4. Estado de la PQRS
        {
          model: EstadoPqrs,
          as: 'EstadoPqrs', 
          attributes: ['id_estado_pqrs', 'nombre_estado']
        }
      ]
    });

    // 5. Devolver la respuesta completa
    res.status(201).json({ 
        message: 'PQRS creada exitosamente.', 
        pqrs: newPqrs 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la PQRS', details: error.message });
  }
};
// 2. Obtener TODAS las PQRS 
exports.getAllPqrsAdmin = async (req, res) => {
  try {
    const pqrsList = await Pqrs.findAll({
      // Incluimos quién la envió y el estado actual
      include: [
        {
          model: User,
          as: 'Remitente',
          attributes: ['correo_electronico']
        },
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(pqrsList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las PQRS', details: error.message });
  }
};

// 3. Responder y Actualizar PQRS (Función clave del Admin)
exports.updatePqrsAdmin = async (req, res) => {
  try {
    const { id_pqrs } = req.params;
    // id_administrador_respuesta debe venir del token del Admin (req.user.id_usuario)
    //const id_usuario = req.user.id_usuario; 
    const body = req.body || {};
    
    // Los campos que el admin puede actualizar
    const { id_estado_pqrs, respuesta_administrador,id_administrador_respuesta } = body;

    const [updated] = await Pqrs.update(
      { 
        id_estado_pqrs, 
        respuesta_administrador, 
        id_administrador_respuesta,
        //id_usuario,
        fecha_ultima_actualizacion: new Date(), // Actualizamos la fecha de gestión
      }, 
      {
        where: { id_pqrs }
      }
    );

    if (updated) {
      const updatedPqrs = await Pqrs.findByPk(id_pqrs);
      return res.status(200).json(updatedPqrs);
    }
    
    return res.status(404).json({ message: 'PQRS no encontrada para actualizar.' });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la PQRS', details: error.message });
  }
};


exports.getPqrsById = async (req, res) => {
  try {
    const { id_pqrs } = req.params;
    

    const pqrs = await Pqrs.findByPk(id_pqrs, {
      include: [
        // 1. Incluir el Remitente (Usuario que la generó)
        {
          model: User,
          as: 'Remitente', 
          attributes: ['id_usuario', 'nombre_usuario', 'correo_electronico']
        },
        // 2. Incluir el Administrador que respondió (si aplica)
        {
          model: User,
          as: 'AdminRespuesta',
          attributes: ['id_usuario']
        },
        // 3. Incluir el Tipo de PQRS (Petición, Queja, etc.)
        {
          model: TipoPqrs,
          as: 'Tipo',
          attributes: ['id_tipo_pqrs']
        },
        // 4. Incluir el Estado de la PQRS (Abierto, Resuelto, etc.)
        {
          model: EstadoPqrs,
          as: 'EstadoPqrs', // Alias definido en associations.js
          attributes: ['id_estado_pqrs']
        },
      ]
    });

    if (!pqrs) {
      return res.status(404).json({ message: 'PQRS no encontrada' });
    }

    res.json(pqrs);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la PQRS', details: error.message });
  }
};