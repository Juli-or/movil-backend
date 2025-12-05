// models/product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Product = sequelize.define('Producto', {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre_producto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion_producto: {
        type: DataTypes.TEXT,
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    unidad_medida: {
        type: DataTypes.STRING,
    },
    url_imagen: {
        
        type: DataTypes.STRING,
    },

    id_SubCategoria: { 
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    estado_producto: {
        type: DataTypes.STRING,
    },
    
    fecha_creacion: {
        type: DataTypes.DATE,
    },
    fecha_ultima_modificacion: {
        type: DataTypes.DATE,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

   
}, {
    tableName: 'producto',
    timestamps: false,
    
});

module.exports = Product;