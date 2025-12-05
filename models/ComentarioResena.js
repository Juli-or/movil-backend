const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ComentarioResena = sequelize.define(
  "comentarios_y_reseñas",
  {
    id_comentario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    calificacion: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    fecha_comentario: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "comentarios_y_reseñas",
    timestamps: false,
  }
);

module.exports = ComentarioResena;
