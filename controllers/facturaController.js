const Factura = require('../models/detalle_pedido');
const Order = require('../models/pedido');

exports.getFacturaByOrderId = async (req, res) => {
  const { orderId } = req.params;
  try {
    const factura = await Factura.findOne({
      where: { id_pedido: orderId },
      include: [{ model: Order, include: ['User'] }]
    });
    if (!factura) {
      return res.status(404).json({ message: 'Factura no encontrada.' });
    }
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
