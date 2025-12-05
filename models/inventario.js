const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Inventario = sequelize.define("Inventario", {
  id_inventario: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  id_producto: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "inventario",
  timestamps: false,
});

module.exports = Inventario;
