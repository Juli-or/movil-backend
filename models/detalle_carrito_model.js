const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const DetalleCarrito = sequelize.define(
  "DetalleCarrito",
  {
    id_item: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_carrito: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "detalle_carrito",
    timestamps: false,
  }
);

module.exports = DetalleCarrito;
