const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Producto = db.define('Producto', {
  id_producto: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_producto: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion_producto: {
    type: DataTypes.TEXT,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(15, 3),
    allowNull: false
  },
  unidad_medida: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  url_imagen: {
    type: DataTypes.STRING(255)
  },
  id_SubCategoria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario: {
    type: DataTypes.BIGINT
  },
  estado_producto: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_ultima_modificacion: {
    type: DataTypes.DATE
  },
  cantidad: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'producto',
  timestamps: false
});

module.exports = Producto;
