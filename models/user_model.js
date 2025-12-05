const { DataTypes } = require("sequelize");
const db = require("../config/db");

const User = db.define(
  "User",
  {
    id_usuario: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_usuario: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    correo_electronico: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, 
      },
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    documento_identidad: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    estado: {
      type: DataTypes.STRING(20),
      defaultValue: "Activo",
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

module.exports = User;
