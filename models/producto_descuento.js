// models/producto_descuento.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductoDescuento = sequelize.define('ProductoDescuento', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true, 
    allowNull: false,
  },
  id_descuento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
}, {  
  tableName: 'producto_descuento', 
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_producto', 'id_descuento'],
    },
  ],
});
module.exports = ProductoDescuento;