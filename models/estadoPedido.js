const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EstadoPedido = sequelize.define("EstadoPedido", {
  id_estado_pedido: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: "estado_pedido",
  timestamps: false,
});

module.exports = EstadoPedido;
