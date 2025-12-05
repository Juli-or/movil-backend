const { DataTypes } = require("sequelize");
const db = require("../config/db");

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
