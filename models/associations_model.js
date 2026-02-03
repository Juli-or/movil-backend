const User = require('./user_model');
const Rol = require('./rol');
const Categoria = require('./categoria');
const SubCategoria = require('./subcategory_model');
const Product = require('./producto_model');
const Descuento = require('./descuento');
const Pedido = require('./pedido');
const DetallePedido = require('./detalle_pedido');
const Pqrs = require('./pqrs');
const ProductoDescuento = require('./producto_descuento');
const EstadoPedido = require('./estadoPedido');
const EstadoPqrs = require('./estadoPqrs');
const TipoPqrs = require('./tipo_pqrs_model');
const Inventario = require('./inventario');

// --- Asociaciones ---

// Rol <-> Usuario
Rol.hasMany(User, { foreignKey: 'id_rol', as: 'Usuarios' });
User.belongsTo(Rol, { foreignKey: 'id_rol', as: 'Rol' });

// Categoria <-> SubCategoria
Categoria.hasMany(SubCategoria, { foreignKey: 'id_categoria', as: 'SubCategorias' });
SubCategoria.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'Categoria' });

// SubCategoria <-> Producto
SubCategoria.hasMany(Product, { foreignKey: 'id_SubCategoria', as: 'Productos' });
Product.belongsTo(SubCategoria, { foreignKey: 'id_SubCategoria', as: 'SubCategoria' });

// Usuario <-> Producto (Productor)
User.hasMany(Product, { foreignKey: 'id_usuario', as: 'Productos' });
Product.belongsTo(User, { foreignKey: 'id_usuario', as: 'Productor' });

// Usuario <-> Pedido (Cliente)
User.hasMany(Pedido, { foreignKey: 'id_usuario', as: 'Pedidos' });
Pedido.belongsTo(User, { foreignKey: 'id_usuario', as: 'Cliente' });

// Pedido <-> DetallePedido
Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido', as: 'Detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido', as: 'Pedido' });

// Producto <-> DetallePedido
Product.hasMany(DetallePedido, { foreignKey: 'id_producto', as: 'Detalles' });
DetallePedido.belongsTo(Product, { foreignKey: 'id_producto', as: 'Producto' });

// Pedido <-> EstadoPedido
EstadoPedido.hasMany(Pedido, { foreignKey: 'id_estado_pedido', as: 'Pedidos' });
Pedido.belongsTo(EstadoPedido, { foreignKey: 'id_estado_pedido', as: 'Estado' });

// Producto <-> Descuento (Many-to-Many via ProductoDescuento)
Product.belongsToMany(Descuento, {
  through: ProductoDescuento,
  foreignKey: 'id_producto',
  otherKey: 'id_descuento',
  as: 'Descuentos'
});
Descuento.belongsToMany(Product, {
  through: ProductoDescuento,
  foreignKey: 'id_descuento',
  otherKey: 'id_producto',
  as: 'Productos'
});

// ProductoDescuento Associations (para consultas directas)
ProductoDescuento.belongsTo(Product, { foreignKey: 'id_producto' });
ProductoDescuento.belongsTo(Descuento, { foreignKey: 'id_descuento' });
Product.hasMany(ProductoDescuento, { foreignKey: 'id_producto' });
Descuento.hasMany(ProductoDescuento, { foreignKey: 'id_descuento' });

// Usuario <-> PQRS
User.hasMany(Pqrs, { foreignKey: 'id_usuario', as: 'PQRS' });
Pqrs.belongsTo(User, { foreignKey: 'id_usuario', as: 'Remitente' });

// Admin <-> PQRS (Respuesta)
User.hasMany(Pqrs, { foreignKey: 'id_administrador_respuesta', as: 'PQRSRespondidas' });
Pqrs.belongsTo(User, { foreignKey: 'id_administrador_respuesta', as: 'AdminRespuesta' });

// EstadoPqrs <-> PQRS
EstadoPqrs.hasMany(Pqrs, { foreignKey: 'id_estado_pqrs', as: 'PQRS' });
Pqrs.belongsTo(EstadoPqrs, { foreignKey: 'id_estado_pqrs', as: 'Estado' });

// TipoPqrs <-> PQRS
TipoPqrs.hasMany(Pqrs, { foreignKey: 'id_tipo_pqrs', as: 'PQRS' });
Pqrs.belongsTo(TipoPqrs, { foreignKey: 'id_tipo_pqrs', as: 'Tipo' });

// Inventario <-> Producto
Product.hasOne(Inventario, { foreignKey: 'id_producto', as: 'Inventario' });
Inventario.belongsTo(Product, { foreignKey: 'id_producto', as: 'Producto' });

// Inventario <-> Usuario (Agricultor) - Opcional si ya está en Producto
// Pero si la tabla inventario tiene id_agricultor:
User.hasMany(Inventario, { foreignKey: 'id_agricultor', as: 'Inventarios' });
Inventario.belongsTo(User, { foreignKey: 'id_agricultor', as: 'Agricultor' });

module.exports = {
  User,
  Rol,
  Categoria,
  SubCategoria,
  Product,
  Descuento,
  Pedido,
  DetallePedido,
  Pqrs,
  ProductoDescuento,
  EstadoPedido,
  EstadoPqrs,
  TipoPqrs,
  Inventario
};
