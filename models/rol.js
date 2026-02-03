const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rol:
 *       type: object
 *       required:
 *         - nombre_rol
 *         - descripcion_rol
 *       properties:
 *         id_rol:
 *           type: integer
 *           description: ID auto-generado del rol
 *         nombre_rol:
 *           type: string
 *           description: Nombre del rol
 *         descripcion_rol:
 *           type: string
 *           description: Descripción de los permisos o función del rol
 *       example:
 *         nombre_rol: "Agricultor"
 *         descripcion_rol: "Usuario que puede publicar productos y gestionar inventario"
 */
const Rol = sequelize.define('rol', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_rol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion_rol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'roles',
  timestamps: false,
});

module.exports = Rol;
