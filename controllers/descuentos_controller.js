const sequelize = require("../config/db");

const getDescuentosActivos = async (req, res) => {
    try {
        const [rows] = await sequelize.query(`
            SELECT 
                d.id_descuento,
                d.nombre_descuento,
                d.tipo_descuento,
                d.valor_descuento,
                d.codigo_descuento,
                p.id_producto,+
                p.nombre_producto
            FROM descuentos d
            LEFT JOIN producto_descuento pd ON d.id_descuento = pd.id_descuento
            LEFT JOIN producto p ON pd.id_producto = p.id_producto
            WHERE d.activo = TRUE
        `);

        res.json(rows);
    } catch (error) {
        console.error("Error en getDescuentosActivos:", error);
        res.status(500).json({ error: "Error al obtener descuentos activos" });
    }
};

const validarCodigo = async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) return res.status(400).json({ mensaje: "Debe enviar un código" });

    try {
        const [rows] = await sequelize.query(`
            SELECT 
                d.id_descuento,
                d.nombre_descuento,
                d.tipo_descuento,
                d.valor_descuento,
                d.codigo_descuento,
                p.id_producto,
                p.nombre_producto
            FROM descuentos d
            LEFT JOIN producto_descuento pd ON d.id_descuento = pd.id_descuento
            LEFT JOIN producto p ON pd.id_producto = p.id_producto
            WHERE d.activo = TRUE AND d.codigo_descuento = :codigo
        `, {
            replacements: { codigo }
        });

        if (rows.length === 0) {
            return res.json({ valido: false, mensaje: "Código inválido o expirado" });
        }

        res.json({ valido: true, mensaje: "Código válido", descuento: rows });
    } catch (error) {
        console.error(" Error en validarCodigo:", error);
        res.status(500).json({ error: "Error al validar el código" });
    }
};

module.exports = { 
    getDescuentosActivos, 
    validarCodigo 
};