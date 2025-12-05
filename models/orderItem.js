// models/orderItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/db.config');
const Order = require('./pedido');
const Product = require('./product');

const OrderItem = sequelize.define('OrderItem', {
  id_detalle_factura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

OrderItem.belongsTo(Order, { foreignKey: 'id_pedido' });
OrderItem.belongsTo(Product, { foreignKey: 'id_producto' });

module.exports = OrderItem;