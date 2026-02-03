const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventario:
 *       type: object
 *       required:
 *         - id_producto
 *       properties:
 *         id_inventario:
 *           type: integer
 *           description: ID auto-generado del registro de inventario
 *         id_producto:
 *           type: integer
 *           description: ID del producto asociado
 *         cantidad_disponible:
 *           type: integer
 *           description: Cantidad actual en stock
 *           default: 0
 *         id_agricultor:
 *           type: integer
 *           description: ID del agricultor dueño del inventario
 *         ubicacion_almacenamiento:
 *           type: string
 *           description: Ubicación física del producto
 *         fecha_ultima_actualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de la última modificación
 *       example:
 *         id_producto: 15
 *         cantidad_disponible: 50
 *         id_agricultor: 2
 *         ubicacion_almacenamiento: "Bodega Norte - Estante 3"
 */
const Inventario = sequelize.define("Inventario", {
  id_inventario: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  id_producto: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  id_agricultor: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  ubicacion_almacenamiento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fecha_ultima_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "inventario",
  timestamps: false,
});

module.exports = Inventario;
