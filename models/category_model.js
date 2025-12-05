const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_categoria: DataTypes.STRING,
  },
  {
    tableName: "categorias",
    timestamps: false,
  }
);

module.exports = Category;
