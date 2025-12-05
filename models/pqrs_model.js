const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Pqrs = sequelize.define(
  "Pqrs",
  {
    id_pqrs: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_tipo_pqrs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_estado_pqrs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_ultima_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pqrs",
    timestamps: false,
  }
);

module.exports = Pqrs;
