// models/pqrs.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pqrs = sequelize.define('Pqrs', {
  id_pqrs: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  
  // Clave Foránea del usuario que crea la PQRS (Remitente)
  id_usuario: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  
  // Clave Foránea al tipo de PQRS (Petición, Queja, Reclamo, Sugerencia)
  id_tipo_pqrs: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  
  asunto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  
  // Clave Foránea al estado de la PQRS (Abierto, En Proceso, Cerrado)
  id_estado_pqrs: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
   fecha_ultima_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
  // Gestión del Administrador:
  respuesta_administrador: {
    type: DataTypes.TEXT, 
    allowNull: true, // Puede ser nulo hasta que se responda
  },
  
  // ID del administrador que responde la PQRS
  id_administrador_respuesta: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
  
 

}, {
  // Opciones del Modelo
  tableName: 'pqrs',
  timestamps: false,
});

module.exports = Pqrs;