const sequelize = require('../config/db');

// modelos
const User = require('./user');
const Rol = require('./rol');
const Categoria = require('./categoria');
const SubCategoria = require('./subCategoria');
const Product = require('./product');
const Descuento = require('./descuento');
const Pedido = require('./pedido');
const DetallePedido = require('./detalle_pedido');
const Pqrs = require('./pqrs');
const ProductoDescuento = require('./producto_descuento');  
const EstadoPedido = require('./estadoPedido');
const EstadoPqrs = require('./estadoPqrs');
const TipoPqrs = require('./tipoPqrs');



// Un Rol tiene muchos Usuarios
Rol.hasMany(User, { foreignKey: 'id_rol', as: 'Usuarios' });
// Un Usuario pertenece a un Rol
User.belongsTo(Rol, { foreignKey: 'id_rol', as: 'Rol' });

// Una Categoría tiene muchas SubCategorías
Categoria.hasMany(SubCategoria, { foreignKey: 'id_categoria', as: 'SubCategorias' });
// Una SubCategoría pertenece a una Categoría
SubCategoria.belongsTo(Categoria, { foreignKey: 'id_categoria' });

// Una SubCategoría tiene muchos Productos
SubCategoria.hasMany(Product, { foreignKey: 'id_SubCategoria', as: 'Productos' });
// Un Producto pertenece a una SubCategoría
Product.belongsTo(SubCategoria, { foreignKey: 'id_SubCategoria' });

// Un Usuario (Productor) tiene muchos Productos
//User.hasMany(Product, { foreignKey: 'id_productor', as: 'ProductosProducidos' });
// Un Producto pertenece a un Usuario (Productor)
//Product.belongsTo(User, { foreignKey: 'id_usuario', as: 'Productor' });



// Un Usuario (Cliente) tiene muchos Pedidos
User.hasMany(Pedido, { foreignKey: 'id_usuario', as: 'PedidosCliente' });
// Un Pedido pertenece a un Usuario (Cliente)
Pedido.belongsTo(User, { foreignKey: 'id_usuario', as: 'Cliente' });

// Un Pedido tiene muchos Detalles (productos dentro del pedido)
Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido', as: 'Detalles' });
// Un DetallePedido pertenece a un Pedido
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

// Un Producto está en muchos Detalles de Pedido
Product.hasMany(DetallePedido, { foreignKey: 'id_producto' });
// Un Detalle de Pedido pertenece a un Producto
DetallePedido.belongsTo(Product, { foreignKey: 'id_producto' });



Pedido.belongsTo(EstadoPedido, { foreignKey: 'id_estado_pedido', as: 'Estado' });
    Product.hasMany(ProductoDescuento, {
    foreignKey: 'id_producto',
    sourceKey: 'id_producto'
});

ProductoDescuento.belongsTo(Descuento, {
    foreignKey: 'id_descuento'
});

ProductoDescuento.belongsTo(Product, {
    foreignKey: 'id_producto'
});

Product.belongsToMany(Descuento, {
    through: ProductoDescuento,
    foreignKey: 'id_producto',
    otherKey: 'id_descuento'
});

Descuento.belongsToMany(Product, {
    through: ProductoDescuento,
    foreignKey: 'id_descuento',
    otherKey: 'id_producto'
});

// Un Usuario puede tener muchas PQRS
User.hasMany(Pqrs, { foreignKey: 'id_usuario', as: 'PQRSGeneradas' });
// Una PQRS pertenece a un Usuario

// 1. PQRS pertenece a un Usuario (Remitente)
Pqrs.belongsTo(User, { foreignKey: 'id_usuario', as: 'Remitente' }); 
// 2. PQRS pertenece a un Usuario (Administrador que responde)
Pqrs.belongsTo(User, { foreignKey: 'id_usuario', as: 'AdminRespuesta' });

// Una PQRS pertenece a un EstadoPqrs (la clave id_estado_pqrs está en PQRS)
Pqrs.belongsTo(EstadoPqrs, { foreignKey: 'id_estado_pqrs', as: 'EstadoPqrs' });

// Un EstadoPqrs puede tener muchas PQRS
EstadoPqrs.hasMany(Pqrs, { foreignKey: 'id_estado_pqrs', as: 'PQRS' });

Pqrs.belongsTo(TipoPqrs, { foreignKey: 'id_tipo_pqrs', as: 'Tipo' });

// Exportar la instancia de Sequelize para la sincronización
module.exports = {
  sequelize,
    User,
    Rol,
    SubCategoria,
    Product,
    Descuento,
    ProductoDescuento,
    EstadoPedido,
    Pedido,
    DetallePedido,
    EstadoPqrs,
    TipoPqrs,
    Pqrs,
};