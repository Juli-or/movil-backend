const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubCategory = sequelize.define(
  "SubCategory",
  {
    id_SubCategoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: DataTypes.STRING,
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "SubCategoria",
    timestamps: false,
  }
);

module.exports = SubCategory;
