
const Categoria = require('./categoria');
const SubCategory = require('./subcategory_model');
const Inventario = require('./inventario');
const Producto = require('./producto_model');
const User = require('./user_model');

// Una Categoría tiene muchas SubCategorías
Categoria.hasMany(SubCategory, { foreignKey: 'id_categoria', as: 'SubCategorias' });
SubCategory.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'Categoria' });

// Asociación Inventario -> Producto
Inventario.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Producto.hasMany(Inventario, { foreignKey: 'id_producto', as: 'inventarios' });

// Asociación Producto -> User (agricultor)
Producto.belongsTo(User, { foreignKey: 'id_usuario', as: 'agricultor' });
User.hasMany(Producto, { foreignKey: 'id_usuario', as: 'productos' });

// Este archivo es cargado en server.js para registrar las asociaciones por efecto colateral
module.exports = { Categoria, SubCategory, Inventario, Producto, User };
