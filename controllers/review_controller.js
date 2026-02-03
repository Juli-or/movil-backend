const sequelize = require("../config/db");

exports.getReviewsByProduct = async (req, res) => {
    const { id_producto } = req.params;
    const userId = req.query.id_usuario_simulado || null; 

    try {
        const reviews = await sequelize.query(
            `
            SELECT 
                cr.id_comentario_resena,
                cr.texto_comentario,
                cr.calificacion,
                cr.fecha_creacion,
                u.nombre_usuario AS autor,
                CASE 
                    WHEN cr.id_usuario = ? THEN true 
                    ELSE false 
                END AS es_mi_comentario
            FROM comentario_resena cr
            JOIN usuarios u ON cr.id_usuario = u.id_usuario
            WHERE cr.id_producto = ? AND cr.estado_comentario = 'Aprobado'
            ORDER BY cr.fecha_creacion DESC
            `,
            {
                replacements: [userId, id_producto],
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.json({ success: true, reviews });
    } catch (error) {
        console.error(" Error al obtener reseñas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener reseñas" 
        });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { id_producto, calificacion, texto_comentario, id_usuario } = req.body;

        if (!id_producto || !calificacion || !texto_comentario || !id_usuario) {
            return res.status(400).json({
                success: false,
                message: "Los campos id_producto, calificacion, texto_comentario e id_usuario son requeridos"
            });
        }

        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({
                success: false,
                message: "La calificación debe ser entre 1 y 5"
            });
        }

        const producto = await sequelize.query(
            "SELECT id_producto FROM producto WHERE id_producto = ?",
            { replacements: [id_producto], type: sequelize.QueryTypes.SELECT }
        );

        if (producto.length === 0) {
            return res.status(404).json({ success: false, message: "Producto no encontrado" });
        }

        const existingReview = await sequelize.query(
            "SELECT id_comentario_resena FROM comentario_resena WHERE id_usuario = ? AND id_producto = ?",
            { replacements: [id_usuario, id_producto], type: sequelize.QueryTypes.SELECT }
        );

        if (existingReview.length > 0) {
            return res.status(400).json({ success: false, message: "Ya has comentado este producto" });
        }

        await sequelize.query(
            `
            INSERT INTO comentario_resena (id_usuario, id_producto, calificacion, texto_comentario, estado_comentario)
            VALUES (?, ?, ?, ?, 'Pendiente')
            `,
            { replacements: [id_usuario, id_producto, calificacion, texto_comentario] }
        );

        res.status(201).json({ 
            success: true,
            message: "Reseña enviada y pendiente de aprobación"
        });
    } catch (error) {
        console.error(" Error al crear reseña:", error);
        res.status(500).json({ success: false, message: "Error al crear reseña" });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const { calificacion, texto_comentario, id_usuario } = req.body;
        
        if (!id_usuario) {
            return res.status(400).json({ success: false, message: "El ID de usuario es requerido." });
        }

        const review = await sequelize.query(
            `SELECT id_comentario_resena FROM comentario_resena 
             WHERE id_comentario_resena = ? AND id_usuario = ?`,
            { replacements: [id_comentario, id_usuario], type: sequelize.QueryTypes.SELECT } 
        );

        if (review.length === 0) {
            return res.status(404).json({ success: false, message: "Reseña no encontrada o no tienes permisos" });
        }

        await sequelize.query(
            `UPDATE comentario_resena 
             SET calificacion = ?, texto_comentario = ?, fecha_creacion = NOW()
             WHERE id_comentario_resena = ?`,
            { replacements: [calificacion, texto_comentario, id_comentario] }
        );

        res.json({ success: true, message: "Reseña actualizada correctamente" });
    } catch (error) {
        console.error(" Error al actualizar reseña:", error);
        res.status(500).json({ success: false, message: "Error al actualizar reseña" });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id_comentario } = req.params;
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ success: false, message: "El ID de usuario es requerido." });
        }

        const review = await sequelize.query(
            `SELECT id_comentario_resena FROM comentario_resena 
             WHERE id_comentario_resena = ? AND id_usuario = ?`,
            { replacements: [id_comentario, id_usuario], type: sequelize.QueryTypes.SELECT } 
        );

        if (review.length === 0) {
            return res.status(404).json({ success: false, message: "Reseña no encontrada o no tienes permisos" });
        }

        await sequelize.query(
            `UPDATE comentario_resena SET estado_comentario = 'Eliminado' 
             WHERE id_comentario_resena = ?`,
            { replacements: [id_comentario] }
        );

        res.json({ success: true, message: "Reseña eliminada correctamente" });
    } catch (error) {
        console.error(" Error al eliminar reseña:", error);
        res.status(500).json({ success: false, message: "Error al eliminar reseña" });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await sequelize.query(
            `SELECT cr.*, u.nombre_usuario 
             FROM comentario_resena cr
             JOIN usuarios u ON cr.id_usuario = u.id_usuario
             ORDER BY cr.fecha_creacion DESC`,
            { type: sequelize.QueryTypes.SELECT }
        );

        res.json({ success: true, reviews });
    } catch (error) {
        console.error(" Error al obtener todas las reseñas:", error);
        res.status(500).json({ success: false, message: "Error al obtener todas las reseñas" });
    }
};
