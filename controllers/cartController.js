const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Product = require('../models/product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { id_usuario: req.user.id_usuario },
      include: [{
        model: CartItem,
        include: [Product],
      }],
    });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado.' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItemToCart = async (req, res) => {
  const { id_producto, cantidad } = req.body;
  try {
    const [cart] = await Cart.findOrCreate({ where: { id_usuario: req.user.id_usuario } });
    const product = await Product.findByPk(id_producto);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    let cartItem = await CartItem.findOne({
      where: { id_carrito: cart.id_carrito, id_producto },
    });

    if (cartItem) {
      cartItem.cantidad_productos += cantidad;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        id_carrito: cart.id_carrito,
        id_producto,
        cantidad_productos: cantidad,
        precio_unitario: product.precio_producto,
      });
    }

    res.status(200).json({ message: 'Producto agregado al carrito.', cartItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Elimina un artículo del carrito
exports.removeItemFromCart = async (req, res) => {
  const { itemId } = req.params;
  try {
    const cart = await Cart.findOne({
      where: { id_usuario: req.user.id_usuario },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    const item = await CartItem.destroy({
      where: {
        id_detalle_carrito: itemId,
        id_carrito: cart.id_carrito,
      },
    });

    if (item === 0) {
      return res.status(404).json({ message: 'Artículo no encontrado en el carrito.' });
    }

    res.json({ message: 'Artículo eliminado del carrito con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el artículo del carrito.', details: error.message });
  }
};