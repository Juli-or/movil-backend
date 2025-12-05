const { DataTypes } = require("sequelize");
const db = require("../config/db");

const EstadoPQRS = db.define("estado_pqrs", {
  id_estado_pqrs: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_estado: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: "estado_pqrs",
  timestamps: false
});

module.exports = EstadoPQRS;
