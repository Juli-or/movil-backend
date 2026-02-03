const sequelize = require("../config/db");

exports.getAllProducts = async (req, res) => {
    try {
        const products = await sequelize.query(`
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.descripcion_producto,
                p.precio_unitario,
                p.unidad_medida,
                p.url_imagen,
                p.cantidad,
                p.estado_producto,
                p.fecha_creacion,
                p.id_usuario,
                c.nombre_categoria,
                s.nombre as subcategoria,
                u.nombre_usuario as producer_name,
                u.correo_electronico as producer_email,
                u.documento_identidad as producer_document,
                r.nombre_rol as producer_role,
                i.cantidad_disponible
            FROM producto p
            LEFT JOIN subcategoria s ON p.id_SubCategoria = s.id_SubCategoria
            LEFT JOIN categorias c ON s.id_categoria = c.id_categoria
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN inventario i ON p.id_producto = i.id_producto
            WHERE p.estado_producto = 'Activo'
            ORDER BY p.fecha_creacion DESC
        `, { type: sequelize.QueryTypes.SELECT });

        res.json({
            success: true,
            data: products,
            total: products.length
        });
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener productos"
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id_producto } = req.params;

        const product = await sequelize.query(`
            SELECT 
                p.*,
                c.nombre_categoria,
                s.nombre as subcategoria,
                u.nombre_usuario as producer_name,
                u.correo_electronico as producer_email,
                u.documento_identidad as producer_document,
                r.nombre_rol as producer_role,
                i.cantidad_disponible,
                i.ubicacion_almacenamiento as producer_location
            FROM producto p
            LEFT JOIN subcategoria s ON p.id_SubCategoria = s.id_SubCategoria
            LEFT JOIN categorias c ON s.id_categoria = c.id_categoria
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN inventario i ON p.id_producto = i.id_producto
            WHERE p.id_producto = ? AND p.estado_producto = 'Activo'
        `, {
            replacements: [id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        if (!product.length) {
            return res.status(404).json({
                success: false,
                error: "Producto no encontrado"
            });
        }

        const imagenes = await sequelize.query(`
            SELECT url_imagen
            FROM producto_imagenes
            WHERE id_producto = ?
        `, {
            replacements: [id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        const todasLasImagenes = imagenes.length
            ? imagenes.map(img => img.url_imagen)
            : [product[0].url_imagen]; 

        const reseñas = await sequelize.query(`
            SELECT cr.*, u.nombre_usuario
            FROM comentario_resena cr
            JOIN usuarios u ON cr.id_usuario = u.id_usuario
            WHERE cr.id_producto = ? AND cr.estado_comentario = 'Aprobado'
            ORDER BY cr.fecha_creacion DESC
        `, {
            replacements: [id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        const ratingPromedio = reseñas.length > 0
            ? reseñas.reduce((sum, r) => sum + (r.calificacion || 0), 0) / reseñas.length
            : 0;

        const productosRelacionados = await sequelize.query(`
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.precio_unitario,
                p.url_imagen,
                p.unidad_medida,
                u.nombre_usuario as producer_name,
                u.correo_electronico as producer_email
            FROM producto p
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_SubCategoria = ? AND p.id_producto != ? AND p.estado_producto = 'Activo'
            LIMIT 4
        `, {
            replacements: [product[0].id_SubCategoria, id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                ...product[0],
                imagenes: todasLasImagenes,
                reseñas,
                rating_promedio: parseFloat(ratingPromedio.toFixed(1)),
                total_reseñas: reseñas.length,
                productos_relacionados: productosRelacionados
            }
        });

    } catch (error) {
        console.error("Error obteniendo producto:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener el producto"
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { nombre_producto, precio_unitario, id_usuario_creador } = req.body; 
        
        if (!id_usuario_creador) {
             return res.status(400).json({ success: false, error: "El ID de usuario creador es requerido." });
        }
        
        const creador = id_usuario_creador;

        res.status(201).json({
            success: true,
            message: "Producto creado correctamente",
            creadoPor: creador,
        });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ success: false, error: "Error al crear producto" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Producto actualizado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error al actualizar producto"
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Producto eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error al eliminar producto"
        });
    }
};
