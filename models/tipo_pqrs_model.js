const { DataTypes } = require("sequelize");
const db = require("../config/db");

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoPQRS:
 *       type: object
 *       required:
 *         - nombre_tipo
 *       properties:
 *         id_tipo_pqrs:
 *           type: integer
 *           description: ID auto-generado
 *         nombre_tipo:
 *           type: string
 *           description: Nombre del tipo de PQRS (Petición, Queja, Reclamo, etc.)
 *       example:
 *         nombre_tipo: "Reclamo"
 */
const TipoPQRS = db.define("tipo_pqrs", {
  id_tipo_pqrs: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_tipo: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: "tipo_pqrs",
  timestamps: false
});

module.exports = TipoPQRS;
