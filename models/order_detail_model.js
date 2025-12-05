const { DataTypes } = require("sequelize");
const db = require("../config/db");

const DetallePedido = db.define("detalle_pedido", {
  id_detalle_pedido: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
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
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  descuento_aplicado_monto: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0.00
  }
}, {
  tableName: "detalle_pedido",
  timestamps: false
});

module.exports = DetallePedido;
