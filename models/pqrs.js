const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pqrs:
 *       type: object
 *       required:
 *         - id_usuario
 *         - id_tipo_pqrs
 *         - asunto
 *         - descripcion
 *       properties:
 *         id_pqrs:
 *           type: integer
 *           description: ID auto-generado de la PQRS
 *         id_usuario:
 *           type: integer
 *           description: ID del usuario que crea la PQRS
 *         id_tipo_pqrs:
 *           type: integer
 *           description: ID del tipo de PQRS
 *         asunto:
 *           type: string
 *           description: Asunto de la solicitud
 *         descripcion:
 *           type: string
 *           description: Detalle de la solicitud
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         id_estado_pqrs:
 *           type: integer
 *           description: ID del estado actual (1=Pendiente, etc.)
 *         respuesta_administrador:
 *           type: string
 *           description: Respuesta dada por el administrador
 *         id_administrador_respuesta:
 *           type: integer
 *           description: ID del administrador que respondió
 *       example:
 *         id_usuario: 5
 *         id_tipo_pqrs: 1
 *         asunto: "Pedido no entregado"
 *         descripcion: "Mi pedido #1234 no ha llegado aún."
 */
const Pqrs = sequelize.define('Pqrs', {
  id_pqrs: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
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
  id_estado_pqrs: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  fecha_ultima_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  respuesta_administrador: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  id_administrador_respuesta: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'pqrs',
  timestamps: false,
});

module.exports = Pqrs;
