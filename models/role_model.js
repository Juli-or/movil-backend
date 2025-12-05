const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Role = db.define(
  "Role",
  {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_rol: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion_rol: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "roles",
    timestamps: false,
  }
);

module.exports = Role;
