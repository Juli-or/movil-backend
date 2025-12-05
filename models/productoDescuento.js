const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductoDescuento = sequelize.define("ProductoDescuento", {
  id_producto: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  id_descuento: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
}, {
  tableName: "producto_descuento",
  timestamps: false,
});

module.exports = ProductoDescuento;
