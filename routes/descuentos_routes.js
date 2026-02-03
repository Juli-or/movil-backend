const express = require("express");
const router = express.Router();
const sequelize = require("../config/db");

// Obtener todos los descuentos
router.get("/", async (req, res) => {
    try {
        const [descuentos] = await sequelize.query(`
      SELECT * FROM descuentos 
      WHERE activo = 1 
      ORDER BY fecha_fin ASC, valor_descuento DESC
    `);

        res.json({
            success: true,
            count: descuentos.length,
            data: descuentos
        });

    } catch (error) {
        console.error("Error obteniendo descuentos:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener descuentos"
        });
    }
});

// Obtener descuentos activos (alias)
router.get("/activos", async (req, res) => {
    try {
        const [descuentos] = await sequelize.query(`
      SELECT * FROM descuentos 
      WHERE activo = 1 
        AND (fecha_inicio IS NULL OR fecha_inicio <= NOW())
        AND (fecha_fin IS NULL OR fecha_fin >= NOW())
      ORDER BY valor_descuento DESC
    `);

        res.json({
            success: true,
            count: descuentos.length,
            data: descuentos
        });

    } catch (error) {
        console.error("Error obteniendo descuentos activos:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener descuentos activos"
        });
    }
});

module.exports = router;