const { DataTypes } = require("sequelize");
const db = require("../config/db");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nombre_usuario
 *         - password_hash
 *         - correo_electronico
 *         - id_rol
 *       properties:
 *         id_usuario:
 *           type: integer
 *           description: ID auto-generado del usuario
 *         nombre_usuario:
 *           type: string
 *           description: Nombre del usuario
 *         correo_electronico:
 *           type: string
 *           description: Correo electrónico del usuario
 *         id_rol:
 *           type: integer
 *           description: ID del rol del usuario
 *         documento_identidad:
 *           type: string
 *           description: Documento de identidad
 *         estado:
 *           type: string
 *           description: Estado del usuario (Activo/Inactivo)
 *       example:
 *         nombre_usuario: juanperez
 *         correo_electronico: juan@example.com
 *         id_rol: 1
 *         documento_identidad: "123456789"
 *         estado: Activo
 */
const User = db.define("User", {
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
}, {
  tableName: "usuarios",
  timestamps: false,
});

module.exports = User;
