const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetallePedido = sequelize.define('DetallePedido', {
  id_detalle_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio_unitario_al_momento: { 
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 3), 
    allowNull: false,
  },
  descuento_aplicado_monto: {
    type: DataTypes.DECIMAL(10, 3), 
    allowNull: false,
    defaultValue: 0.000,
  },
}, {
  tableName: 'detalle_pedido',
  timestamps: false,
});

module.exports = DetallePedido;
