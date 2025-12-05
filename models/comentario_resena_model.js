// models/comentario_resena_model.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ComentarioResena extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
      this.belongsTo(models.Producto, { foreignKey: 'id_producto' });
    }
  }

  ComentarioResena.init({
    id_comentario_resena: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_producto: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    calificacion: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 }
    },
    texto_comentario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado_comentario: {
      type: DataTypes.STRING(20),
      defaultValue: 'Pendiente'
    }
  }, {
    sequelize,
    modelName: 'ComentarioResena',
    tableName: 'comentario_resena',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return ComentarioResena;
};