const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EstadoPqrs = sequelize.define('EstadoPqrs', {
  id_estado_pqrs: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_estado: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'estado_pqrs',
  timestamps: false,
});

module.exports = EstadoPqrs;
