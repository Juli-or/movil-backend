const sequelize = require("../config/db");

const getOfertasActivas = async (req, res) => {
    try {
        const [rows] = await sequelize.query(
            `SELECT 
              o.id_oferta,
              o.nombre_oferta,
              o.descripcion_oferta,
              o.tipo_oferta,
              o.fecha_inicio,
              o.fecha_fin,
              p.id_producto,
              p.nombre_producto,
              p.descripcion_producto,
              p.precio_unitario,
              p.unidad_medida,
              p.url_imagen,
              d.nombre_descuento,
              d.tipo_descuento,
              d.valor_descuento AS descuento_porcentaje,
              d.codigo_descuento
            FROM ofertas o
            INNER JOIN producto_oferta po ON o.id_oferta = po.id_oferta
            INNER JOIN producto p ON po.id_producto = p.id_producto
            LEFT JOIN producto_descuento pd ON p.id_producto = pd.id_producto
            LEFT JOIN descuentos d ON pd.id_descuento = d.id_descuento AND d.activo = TRUE
            WHERE o.activo = TRUE`
        );

        res.json(rows);
    } catch (error) {
        console.error(" Error en getOfertasActivas:", error);
        res.status(500).json({ error: "Error al obtener ofertas activas" });
    }
};

const validarCodigo = async (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({ error: "Debes ingresar un código" });
        }

        const [rows] = await sequelize.query(
            `SELECT d.id_descuento, d.nombre_descuento, d.tipo_descuento, d.valor_descuento, d.codigo_descuento
            FROM descuentos d
            WHERE d.codigo_descuento = :codigo
              AND d.activo = TRUE
              AND d.fecha_inicio <= NOW()
              AND d.fecha_fin >= NOW()`,
            { replacements: { codigo } }
        );

        if (rows.length === 0) {
            return res.status(404).json({ valido: false, mensaje: "Código inválido o expirado" });
        }

        res.json({
            valido: true,
            mensaje: "Código válido ",
            descuento: rows[0],
        });
    } catch (error) {
        console.error(" Error en validarCodigo:", error);
        res.status(500).json({ error: "Error al validar el código" });
    }
};

module.exports = { getOfertasActivas, validarCodigo };