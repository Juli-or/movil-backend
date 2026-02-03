const db = require("../config/db");

function COP(valor) {
    if (!valor && valor !== 0) return "0";
    return Number(valor).toLocaleString("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

module.exports = {
    async listarCodigos(req, res) {
        try {
            const sql = `
                -- DESCUENTOS CON CÓDIGO
                SELECT 
                    d.id_descuento as id,
                    d.nombre_descuento as nombre,
                    d.tipo_descuento,
                    d.valor_descuento,
                    d.codigo_descuento as codigo,
                    d.fecha_inicio,
                    d.fecha_fin,
                    d.estado,
                    d.activo,
                    'descuento' as tipo,
                    u.nombre_usuario as productor_nombre,
                    CASE 
                        WHEN d.codigo_descuento IS NULL OR d.codigo_descuento = '' THEN 1
                        ELSE 0 
                    END as es_sin_codigo,
                    CASE 
                        WHEN CURDATE() BETWEEN DATE(d.fecha_inicio) AND DATE(d.fecha_fin) THEN 'vigente'
                        WHEN CURDATE() < DATE(d.fecha_inicio) THEN 'futuro'
                        ELSE 'expirado'
                    END as estado_vigencia
                FROM descuentos d
                LEFT JOIN usuarios u ON d.id_productor = u.id_usuario
                WHERE d.activo = 1
                AND d.estado = 'Aprobado'
                
                UNION ALL
                
                -- OFERTAS
                SELECT 
                    o.id_oferta as id,
                    o.nombre_oferta as nombre,
                    o.tipo_oferta as tipo_descuento,
                    NULL as valor_descuento,
                    CONCAT('OFERTA', o.id_oferta) as codigo,
                    o.fecha_inicio,
                    o.fecha_fin,
                    'Aprobado' as estado,
                    o.activo,
                    'oferta' as tipo,
                    NULL as productor_nombre,
                    0 as es_sin_codigo,
                    CASE 
                        WHEN CURDATE() BETWEEN DATE(o.fecha_inicio) AND DATE(o.fecha_fin) THEN 'vigente'
                        WHEN CURDATE() < DATE(o.fecha_inicio) THEN 'futuro'
                        ELSE 'expirado'
                    END as estado_vigencia
                FROM ofertas o
                WHERE o.activo = 1
                
                ORDER BY 
                    tipo ASC,
                    estado_vigencia ASC,
                    fecha_fin ASC
            `;

            const [rows] = await db.query(sql);

            const codigosFormateados = rows.map(item => {
                let valorDescuento = "";
                let esSinCodigo = item.es_sin_codigo === 1;

                if (item.tipo === 'descuento' && item.tipo_descuento === "Porcentaje") {
                    valorDescuento = `${Number(item.valor_descuento) * 100}% OFF`;
                } else if (item.tipo === 'descuento' && item.tipo_descuento === "Monto Fijo") {
                    valorDescuento = `$${COP(item.valor_descuento)} OFF`;
                } else if (item.tipo === 'oferta') {
                    valorDescuento = "OFERTA ESPECIAL";
                }

                const diasRestantes = Math.ceil(
                    (new Date(item.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)
                );

                const codigoMostrar = esSinCodigo ?
                    `DESC${item.id}` :
                    (item.codigo || `DESC${item.id}`);

                return {
                    ...item,
                    valor_formateado: valorDescuento,
                    dias_restantes: diasRestantes,
                    es_sin_codigo: esSinCodigo,
                    codigo_mostrar: codigoMostrar,
                    esta_vigente: item.estado_vigencia === 'vigente',
                    esta_expirado: item.estado_vigencia === 'expirado',
                    es_futuro: item.estado_vigencia === 'futuro'
                };
            });

            return res.json({
                success: true,
                codigos: codigosFormateados
            });

        } catch (error) {
            console.error("❌ ERROR en listarCodigos:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async validarCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const codigoFormateado = codigo.trim().toUpperCase();

            if (!codigoFormateado) {
                return res.json({
                    success: true,
                    valido: false,
                    mensaje: "❌ Por favor ingresa un código o ID",
                    productos: []
                });
            }

            let promocion = null;
            let tipoPromocion = '';
            let esPorID = false;

            if (codigoFormateado.startsWith('OFERTA')) {
                const idOferta = codigoFormateado.replace('OFERTA', '');
                const [ofertas] = await db.query(`
                    SELECT *, 'oferta' as tipo
                    FROM ofertas 
                    WHERE id_oferta = ? 
                    AND activo = 1
                    LIMIT 1
                `, [idOferta]);

                if (ofertas.length > 0) {
                    promocion = ofertas[0];
                    tipoPromocion = 'oferta';
                }
            } else {
                const [descuentos] = await db.query(`
                    SELECT d.*, 'descuento' as tipo
                    FROM descuentos d
                    WHERE (UPPER(d.codigo_descuento) = ? OR UPPER(CONCAT('DESC', d.id_descuento)) = ?)
                    AND d.activo = 1
                    AND d.estado = 'Aprobado'
                    LIMIT 1
                `, [codigoFormateado, codigoFormateado]);

                if (descuentos.length > 0) {
                    promocion = descuentos[0];
                    tipoPromocion = 'descuento';
                    esPorID = promocion.codigo_descuento === null &&
                        codigoFormateado === `DESC${promocion.id_descuento}`;
                } else {
                    const idDescuento = parseInt(codigoFormateado.replace('DESC', ''));
                    if (!isNaN(idDescuento)) {
                        const [descuentosPorID] = await db.query(`
                            SELECT d.*, 'descuento' as tipo
                            FROM descuentos d
                            WHERE d.id_descuento = ?
                            AND d.activo = 1
                            AND d.estado = 'Aprobado'
                            LIMIT 1
                        `, [idDescuento]);

                        if (descuentosPorID.length > 0) {
                            promocion = descuentosPorID[0];
                            tipoPromocion = 'descuento';
                            esPorID = true;
                        }
                    }
                }
            }

            if (!promocion) {
                return res.json({
                    success: true,
                    valido: false,
                    mensaje: "❌ Código no encontrado",
                    productos: []
                });
            }

            let productosDB = [];

            if (tipoPromocion === 'oferta') {
                const [productosOferta] = await db.query(`
                    SELECT 
                        p.id_producto,
                        p.nombre_producto,
                        p.descripcion_producto,
                        p.precio_unitario,
                        p.unidad_medida,
                        p.url_imagen,
                        p.estado_producto,
                        p.cantidad,
                        sc.nombre as subcategoria_nombre,
                        c.nombre_categoria as categoria_nombre
                    FROM producto p
                    INNER JOIN producto_oferta po ON p.id_producto = po.id_producto
                    INNER JOIN subcategoria sc ON p.id_SubCategoria = sc.id_SubCategoria
                    INNER JOIN categorias c ON sc.id_categoria = c.id_categoria
                    WHERE po.id_oferta = ?
                    AND p.estado_producto = 'Activo'
                    ORDER BY p.nombre_producto
                `, [promocion.id_oferta]);

                productosDB = productosOferta;
            } else {
                const [productosDescuento] = await db.query(`
                    SELECT 
                        p.id_producto,
                        p.nombre_producto,
                        p.descripcion_producto,
                        p.precio_unitario,
                        p.unidad_medida,
                        p.url_imagen,
                        p.estado_producto,
                        p.cantidad,
                        sc.nombre as subcategoria_nombre,
                        c.nombre_categoria as categoria_nombre
                    FROM producto p
                    INNER JOIN producto_descuento pd ON p.id_producto = pd.id_producto
                    INNER JOIN subcategoria sc ON p.id_SubCategoria = sc.id_SubCategoria
                    INNER JOIN categorias c ON sc.id_categoria = c.id_categoria
                    WHERE pd.id_descuento = ?
                    AND p.estado_producto = 'Activo'
                    ORDER BY p.nombre_producto
                `, [promocion.id_descuento]);

                productosDB = productosDescuento;
            }

            const productosProcesados = productosDB.map(producto => {
                let precioOriginal = Number(producto.precio_unitario) || 0;
                let precioFinal = precioOriginal;
                let descuentoInfo = "";

                if (tipoPromocion === 'descuento') {
                    if (promocion.tipo_descuento === "Porcentaje") {
                        const descuentoDecimal = Number(promocion.valor_descuento) || 0;
                        precioFinal = precioOriginal - (precioOriginal * descuentoDecimal);
                        descuentoInfo = `${descuentoDecimal * 100}% OFF`;
                    } else if (promocion.tipo_descuento === "Monto Fijo") {
                        const descuentoMonto = Number(promocion.valor_descuento) || 0;
                        precioFinal = precioOriginal - descuentoMonto;
                        descuentoInfo = `$${COP(descuentoMonto)} OFF`;
                    }
                } else {
                    descuentoInfo = "OFERTA ESPECIAL";
                }

                if (precioFinal < 0) precioFinal = 0;

                const codigoMostrar = tipoPromocion === 'oferta' ?
                    `OFERTA${promocion.id_oferta}` :
                    (promocion.codigo_descuento || `DESC${promocion.id_descuento}`);

                const nombrePromocion = tipoPromocion === 'oferta' ?
                    promocion.nombre_oferta : promocion.nombre_descuento;

                return {
                    ...producto,
                    precio_original: precioOriginal,
                    precio_final: precioFinal,
                    precio_original_format: COP(precioOriginal),
                    precio_final_format: COP(precioFinal),
                    descuento_info: descuentoInfo,
                    tiene_descuento: tipoPromocion === 'descuento',
                    tiene_oferta: tipoPromocion === 'oferta',
                    tipo_promocion: tipoPromocion,
                    codigo_promocion: codigoMostrar,
                    nombre_promocion: nombrePromocion,
                    es_sin_codigo: tipoPromocion === 'descuento' && !promocion.codigo_descuento
                };
            });

            const mensaje = tipoPromocion === 'oferta' ?
                `✅ Oferta ${promocion.nombre_oferta} válida` :
                esPorID ?
                    `✅ Descuento ${promocion.nombre_descuento} válido` :
                    `✅ Código ${promocion.codigo_descuento || 'DESC' + promocion.id_descuento} válido`;

            return res.json({
                success: true,
                valido: true,
                mensaje: mensaje,
                promocion: promocion,
                tipo_promocion: tipoPromocion,
                productos: productosProcesados,
                es_por_id: esPorID
            });

        } catch (error) {
            console.error("❌ ERROR en validarCodigo:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async productosEnOferta(req, res) {
        try {
            const sql = `
                -- Productos con DESCUENTOS
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
                    p.descripcion_producto,
                    p.precio_unitario,
                    p.unidad_medida,
                    p.url_imagen,
                    p.estado_producto,
                    p.cantidad,
                    sc.nombre as subcategoria_nombre,
                    c.nombre_categoria as categoria_nombre,
                    
                    d.id_descuento as id_promocion,
                    d.nombre_descuento as nombre_promocion,
                    COALESCE(d.codigo_descuento, CONCAT('DESC', d.id_descuento)) as codigo_promocion,
                    d.tipo_descuento,
                    d.valor_descuento,
                    d.fecha_inicio,
                    d.fecha_fin,
                    d.estado,
                    d.activo,
                    
                    'descuento' as tipo_promocion,
                    CASE 
                        WHEN d.codigo_descuento IS NULL OR d.codigo_descuento = '' THEN 1
                        ELSE 0 
                    END as es_sin_codigo
                    
                FROM producto p
                
                INNER JOIN producto_descuento pd ON p.id_producto = pd.id_producto
                INNER JOIN descuentos d ON pd.id_descuento = d.id_descuento
                INNER JOIN subcategoria sc ON p.id_SubCategoria = sc.id_SubCategoria
                INNER JOIN categorias c ON sc.id_categoria = c.id_categoria
                
                WHERE p.estado_producto = 'Activo'
                AND d.activo = 1
                AND d.estado = 'Aprobado'
                
                UNION ALL
                
                -- Productos con OFERTAS
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
                    p.descripcion_producto,
                    p.precio_unitario,
                    p.unidad_medida,
                    p.url_imagen,
                    p.estado_producto,
                    p.cantidad,
                    sc.nombre as subcategoria_nombre,
                    c.nombre_categoria as categoria_nombre,
                    
                    o.id_oferta as id_promocion,
                    o.nombre_oferta as nombre_promocion,
                    CONCAT('OFERTA', o.id_oferta) as codigo_promocion,
                    o.tipo_oferta as tipo_descuento,
                    NULL as valor_descuento,
                    o.fecha_inicio,
                    o.fecha_fin,
                    'Aprobado' as estado,
                    o.activo,
                    
                    'oferta' as tipo_promocion,
                    0 as es_sin_codigo
                    
                FROM producto p
                
                INNER JOIN producto_oferta po ON p.id_producto = po.id_producto
                INNER JOIN ofertas o ON po.id_oferta = o.id_oferta
                INNER JOIN subcategoria sc ON p.id_SubCategoria = sc.id_SubCategoria
                INNER JOIN categorias c ON sc.id_categoria = c.id_categoria
                
                WHERE p.estado_producto = 'Activo'
                AND o.activo = 1
                
                ORDER BY tipo_promocion, nombre_producto
            `;

            const [rows] = await db.query(sql);

            const productosProcesados = rows.map(producto => {
                let precioOriginal = Number(producto.precio_unitario) || 0;
                let precioFinal = precioOriginal;
                let descuentoInfo = "";
                let esSinCodigo = producto.es_sin_codigo === 1;

                if (producto.tipo_promocion === 'descuento') {
                    if (producto.tipo_descuento === "Porcentaje") {
                        const descuentoDecimal = Number(producto.valor_descuento) || 0;
                        precioFinal = precioOriginal - (precioOriginal * descuentoDecimal);
                        descuentoInfo = `${descuentoDecimal * 100}% OFF`;
                    } else if (producto.tipo_descuento === "Monto Fijo") {
                        const descuentoMonto = Number(producto.valor_descuento) || 0;
                        precioFinal = precioOriginal - descuentoMonto;
                        descuentoInfo = `$${COP(descuentoMonto)} OFF`;
                    }
                } else {
                    descuentoInfo = "OFERTA ESPECIAL";
                }

                if (precioFinal < 0) precioFinal = 0;

                const diasRestantes = Math.ceil(
                    (new Date(producto.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)
                );

                const codigoMostrar = esSinCodigo ?
                    `DESC${producto.id_promocion}` :
                    producto.codigo_promocion;

                return {
                    ...producto,
                    precio_original: precioOriginal,
                    precio_final: precioFinal,
                    precio_original_format: COP(precioOriginal),
                    precio_final_format: COP(precioFinal),
                    descuento_info: descuentoInfo,
                    tiene_descuento: producto.tipo_promocion === 'descuento',
                    tiene_oferta: producto.tipo_promocion === 'oferta',
                    dias_restantes: diasRestantes,
                    es_sin_codigo: esSinCodigo,
                    codigo_mostrar: codigoMostrar,
                    estado_vigencia: diasRestantes > 0 ? 'vigente' : 'expirado',
                    esta_vigente: diasRestantes > 0,
                    esta_expirado: diasRestantes <= 0
                };
            });

            return res.json({
                success: true,
                productos: productosProcesados
            });

        } catch (error) {
            console.error("❌ ERROR en productosEnOferta:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
