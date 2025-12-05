const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Producto = sequelize.define("Producto", {
  id_producto: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_producto: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion_producto: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unidad_medida: {
    type: DataTypes.STRING(50),
  },
  url_imagen: {
    type: DataTypes.STRING(255),
  },
  id_SubCategoria: {
    type: DataTypes.INTEGER,
  },
  estado_producto: {
    type: DataTypes.STRING(50),
    defaultValue: "Activo",
  },
  id_usuario: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
}, {
  tableName: "producto",
  timestamps: false,
});

module.exports = Producto;
