const { Model, DataTypes } = require('sequelize');

class Producto extends Model {
  static associate(models) {
    this.belongsTo(models.Subcategoria, {
      foreignKey: 'id_SubCategoria',
      as: 'Subcategoria'
    });
    
    this.hasMany(models.ComentarioResena, {
      foreignKey: 'id_producto',
      as: 'comentarios'
    });
    
    this.hasMany(models.ProductoDescuento, {
      foreignKey: 'id_producto',
      as: 'descuentos'
    });
  }
}

class ComentarioResena extends Model {
  static associate(models) {
    this.belongsTo(models.Producto, {
      foreignKey: 'id_producto',
      as: 'producto'
    });
    
    this.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'Usuario'
    });
  }
}

class Subcategoria extends Model {
  static associate(models) {
    this.belongsTo(models.Categoria, {
      foreignKey: 'id_categoria',
      as: 'Categoria'
    });
    
    this.hasMany(models.Producto, {
      foreignKey: 'id_SubCategoria',
      as: 'productos'
    });
  }
}

class Categoria extends Model {
  static associate(models) {
    this.hasMany(models.Subcategoria, {
      foreignKey: 'id_categoria',
      as: 'subcategorias'
    });
  }
}

class ProductoDescuento extends Model {
  static associate(models) {
    this.belongsTo(models.Producto, {
      foreignKey: 'id_producto',
      as: 'producto'
    });
    
    this.belongsTo(models.Descuento, {
      foreignKey: 'id_descuento',
      as: 'Descuento'
    });
  }
}