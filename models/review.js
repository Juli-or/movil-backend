// models/review.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Product = require('./product');

const Review = sequelize.define('Review', {
  id_comentario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clasificacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comentario: {
    type: DataTypes.TEXT,
  },
  fecha_comentario: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }},{
    tableName: comentario_resena,
    timestamps: false


});

Review.belongsTo(User, { foreignKey: 'id_usuario' });
Review.belongsTo(Product, { foreignKey: 'id_producto' });

module.exports = Review;