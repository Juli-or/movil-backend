const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Inventory = sequelize.define(
  "Inventory",
  {
    id_inventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_agricultor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad_disponible: DataTypes.INTEGER,
  },
  {
    tableName: "inventario",
    timestamps: false,
  }
);

module.exports = Inventory;
