const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
const PDFDocument = require('pdfkit');

const obtenerOrdenes = async (req, res) => {
  try {
    const idProductor = req.user.id_usuario;

    const sql = `
      SELECT 
        ped.id_pedido,
        ped.fecha_pedido,
        ped.id_usuario AS id_cliente,
        u.nombre_usuario AS cliente,
        ped.direccion_envio AS direccion_envio,
        ped.ciudad_envio AS ciudad_envio,
        ep.nombre_estado AS estado,
        ped.numero_seguimiento AS numero_seguimiento,
        SUM(dp.subtotal - dp.descuento_aplicado_monto) AS total
      FROM pedidos ped
      INNER JOIN usuarios u ON ped.id_usuario = u.id_usuario
      INNER JOIN detalle_pedido dp ON ped.id_pedido = dp.id_pedido
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      INNER JOIN inventario i ON p.id_producto = i.id_producto
      INNER JOIN estado_pedido ep ON ped.id_estado_pedido = ep.id_estado_pedido
      WHERE i.id_agricultor = :idProductor
      GROUP BY ped.id_pedido, ped.fecha_pedido, ped.direccion_envio, ped.ciudad_envio, ped.numero_seguimiento, u.nombre_usuario, ep.nombre_estado
      ORDER BY ped.fecha_pedido DESC;
    `;

    const ordenes = await sequelize.query(sql, {
      replacements: { idProductor },
      type: QueryTypes.SELECT,
    });

    res.json(ordenes);
  } catch (error) {
    console.error(" Error al obtener órdenes:", error);
    res.status(500).json({ error: "Error al obtener órdenes del productor" });
  }
};

const obtenerTodasLasOrdenes = async (req, res) => {
  try {
    const { search, fechaInicio, fechaFin, estado } = req.query;

    let whereConditions = [];
    const replacements = {};

    if (fechaInicio) {
      whereConditions.push("DATE(ped.fecha_pedido) >= :fechaInicio");
      replacements.fechaInicio = fechaInicio;
    }
    if (fechaFin) {
      whereConditions.push("DATE(ped.fecha_pedido) <= :fechaFin");
      replacements.fechaFin = fechaFin;
    }
    if (estado && estado !== 'Todos') {
      whereConditions.push("ep.nombre_estado = :estado");
      replacements.estado = estado;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    let havingClause = "";
    if (search) {
      havingClause = `HAVING (
        CAST(id_pedido AS CHAR) LIKE :search OR 
        cliente LIKE :search OR 
        ciudad_envio LIKE :search OR 
        productos_resumen LIKE :search OR
        numero_seguimiento LIKE :search
      )`;
      replacements.search = `%${search}%`;
    }

    const sql = `
      SELECT 
        ped.id_pedido,
        ped.fecha_pedido,
        ped.id_usuario AS id_cliente,
        u.nombre_usuario AS cliente,
        ped.direccion_envio AS direccion_envio,
        ped.ciudad_envio AS ciudad_envio,
        ep.nombre_estado AS estado,
        ped.numero_seguimiento AS numero_seguimiento,
        SUM(dp.subtotal - dp.descuento_aplicado_monto) AS total,
        GROUP_CONCAT(CONCAT(p.nombre_producto, ' (x', dp.cantidad, ')') SEPARATOR ', ') AS productos_resumen
      FROM pedidos ped
      INNER JOIN usuarios u ON ped.id_usuario = u.id_usuario
      INNER JOIN detalle_pedido dp ON ped.id_pedido = dp.id_pedido
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      INNER JOIN estado_pedido ep ON ped.id_estado_pedido = ep.id_estado_pedido
      ${whereClause}
      GROUP BY ped.id_pedido, ped.fecha_pedido, ped.direccion_envio, ped.ciudad_envio, ped.numero_seguimiento, u.nombre_usuario, ep.nombre_estado
      ${havingClause}
      ORDER BY ped.fecha_pedido DESC;
    `;

    const ordenes = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json(ordenes);
  } catch (error) {
    console.error(" Error al obtener todas las órdenes:", error);
    res.status(500).json({ error: "Error al obtener todas las órdenes" });
  }
};


const actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; 

  try {
    const [estadoResult] = await sequelize.query(
      `SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = :estado`,
      { replacements: { estado }, type: QueryTypes.SELECT }
    );

    if (!estadoResult) {
        return res.status(404).json({ error: "El nombre del estado no es válido." });
    }
    
    const id_estado = estadoResult.id_estado_pedido;

    const sql = `
      UPDATE pedidos 
      SET id_estado_pedido = :id_estado 
      WHERE id_pedido = :id;
    `;

    await sequelize.query(sql, {
      replacements: { id_estado, id },
    });

    res.json({ mensaje: "Estado de la orden actualizado correctamente" });
  } catch (error) {
    console.error(" Error al actualizar el estado:", error);
    res.status(500).json({ error: "No se pudo actualizar el estado de la orden" });
  }
};

const generarComprobante = async (req, res) => {
    const { id } = req.params; 

    try {
        // TODO: Implementar consulta real a la base de datos para obtener datos del pedido
        // Por ahora se usa data mockeada como estaba en la versión anterior para no romper la funcionalidad
        const datosOrden = {
            fecha_pedido: new Date(),
            cliente: "Cliente (ID: " + id + ")",
            direccion_envio: "Dirección registrada",
            ciudad_envio: "Ciudad",
            productos: [
                { nombre: "Producto Ejemplo", cantidad: 1, precio: 0, subtotal: 0 }
            ],
            total: 0
        };
        
        if (!datosOrden) {
            return res.status(404).json({ error: "Orden no encontrada." });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=comprobante_${id}.pdf`);
        
        const doc = new PDFDocument();
        doc.pipe(res); 

        doc.fontSize(25).text('Comprobante de Pedido - Agrosoft', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Pedido #${id}`, { align: 'right' });
        doc.text(`Fecha: ${datosOrden.fecha_pedido.toLocaleDateString()}`);
        doc.text(`Cliente: ${datosOrden.cliente}`);
        doc.text(`Dirección de Envío: ${datosOrden.direccion_envio}, ${datosOrden.ciudad_envio}`);
        doc.moveDown();

        doc.fontSize(10);
        doc.text('Producto', 50, doc.y, { width: 150, continued: true });
        doc.text('Cantidad', 200, doc.y, { width: 100, continued: true });
        doc.text('Subtotal', 350, doc.y, { width: 100 });
        doc.moveDown(0.5);
        doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        datosOrden.productos.forEach(p => {
            doc.text(p.nombre, 50, doc.y, { width: 150, continued: true });
            doc.text(p.cantidad.toString(), 200, doc.y, { width: 100, continued: true });
            doc.text(`$${p.subtotal.toFixed(2)}`, 350, doc.y, { width: 100 });
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(14).text(`TOTAL: $${datosOrden.total.toFixed(2)}`, { align: 'right' });
        
        doc.end(); 

    } catch (error) {
        console.error(" Error al generar el comprobante PDF:", error);
        res.status(500).json({ error: "No se pudo generar el comprobante" });
    }
};

module.exports = {
  obtenerOrdenes,
  obtenerTodasLasOrdenes,
  actualizarEstadoOrden,
  generarComprobante
};
