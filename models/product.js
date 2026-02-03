// models/product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - nombre_producto
 *         - precio_unitario
 *       properties:
 *         id_producto:
 *           type: integer
 *           description: ID auto-generado
 *         nombre_producto:
 *           type: string
 *         descripcion_producto:
 *           type: string
 *         precio_unitario:
 *           type: number
 *           format: float
 *         unidad_medida:
 *           type: string
 *         url_imagen:
 *           type: string
 *         id_SubCategoria:
 *           type: integer
 *         estado_producto:
 *           type: string
 *         cantidad:
 *           type: integer
 *       example:
 *         nombre_producto: "Manzanas"
 *         precio_unitario: 5000
 *         unidad_medida: "kg"
 *         cantidad: 100
 */
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