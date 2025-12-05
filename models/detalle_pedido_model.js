const DataTypes  = require('sequelize');
const  db  = require('../config/db');
const Pedido = require('./pedido_model');
const Producto = require('./producto_model');

const DetallePedido = db.define('DetallePedido', {
  id_detalle_pedido: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_pedido: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  id_producto: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario_al_momento: {
    type: DataTypes.DECIMAL(10,3),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10,3),
    allowNull: false
  },
  descuento_aplicado_monto: {
    type: DataTypes.DECIMAL(10,3),
    defaultValue: 0
  }
}, {
  tableName: 'detalle_pedido',
  timestamps: false
});

// Relaciones
Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });
DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

module.exports = DetallePedido;
