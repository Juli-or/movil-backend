const { DataTypes } = require('sequelize');
const  db  = require('../config/db');

const Carrito = db.define('Carrito', {
  id_carrito: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_ultima_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado_carrito: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'carrito',
  timestamps: false
});

module.exports = Carrito;
