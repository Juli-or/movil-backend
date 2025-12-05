const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Descuento = sequelize.define("Descuento", {
  id_descuento: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_descuento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo_descuento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  codigo_descuento: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  valor_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(50),
    defaultValue: "Pendiente",
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "descuentos",
  timestamps: false,
});

module.exports = Descuento;
