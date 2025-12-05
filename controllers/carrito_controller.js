const sequelize = require('../config/db');


const getActiveCart = async (req, res) => {
    try {
        console.log('=== INICIANDO getActiveCart ===');
        const { id_usuario } = req.params;
        console.log('ID Usuario recibido:', id_usuario);

        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                error: "ID de usuario es requerido"
            });
        }


        console.log('Buscando carrito existente...');
        let carrito = await sequelize.query(`
            SELECT * FROM carrito 
            WHERE id_usuario = ?
            ORDER BY id_carrito DESC 
            LIMIT 1
        `, {
            replacements: [id_usuario],
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Carritos encontrados:', carrito.length);

        let id_carrito;


        if (carrito.length === 0) {
            console.log('No existe ningún carrito, creando uno nuevo...');
            try {
                const nuevoCarrito = await sequelize.query(`
                    INSERT INTO carrito (id_usuario, estado_carrito) 
                    VALUES (?, 'Activo')
                `, {
                    replacements: [id_usuario],
                    type: sequelize.QueryTypes.INSERT
                });

                id_carrito = nuevoCarrito[0];
                console.log(' Nuevo carrito creado con ID:', id_carrito);

                carrito = [{
                    id_carrito: id_carrito,
                    id_usuario: parseInt(id_usuario),
                    estado_carrito: 'Activo',
                    fecha_creacion: new Date(),
                    fecha_ultima_actualizacion: new Date()
                }];
            } catch (insertError) {
                console.log(' Error al crear carrito:', insertError.message);
                return res.status(500).json({
                    success: false,
                    error: "No se pudo crear el carrito",
                    details: insertError.message
                });
            }
        } else {

            id_carrito = carrito[0].id_carrito;
            console.log('Carrito existente encontrado con ID:', id_carrito, 'Estado:', carrito[0].estado_carrito);

            if (carrito[0].estado_carrito !== 'Activo') {
                console.log('Reactivando carrito...');
                await sequelize.query(`
                    UPDATE carrito 
                    SET estado_carrito = 'Activo', fecha_ultima_actualizacion = NOW()
                    WHERE id_carrito = ?
                `, {
                    replacements: [id_carrito],
                    type: sequelize.QueryTypes.UPDATE
                });
                carrito[0].estado_carrito = 'Activo';
                carrito[0].fecha_ultima_actualizacion = new Date();
                console.log(' Carrito reactivado');
            }
        }


        console.log('Obteniendo items del carrito...');
        const items = await sequelize.query(`
            SELECT 
                dc.id_detalle_carrito,
                dc.id_producto,
                dc.cantidad,
                dc.precio_unitario_al_momento,
                dc.subtotal,
                p.nombre_producto,
                p.descripcion_producto,
                p.precio_unitario as precio_actual,
                p.url_imagen,
                p.unidad_medida,
                p.cantidad as stock_disponible,
                p.estado_producto
            FROM detalle_carrito dc
            INNER JOIN producto p ON dc.id_producto = p.id_producto
            WHERE dc.id_carrito = ?
            ORDER BY dc.id_detalle_carrito DESC
        `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Items encontrados:', items.length);


        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
        const totalItems = items.reduce((sum, item) => sum + parseInt(item.cantidad || 0), 0);

        console.log(' Resumen - Subtotal:', subtotal, 'Total items:', totalItems);


        res.json({
            success: true,
            data: {
                ...carrito[0],
                items: items,
                resumen: {
                    subtotal: subtotal,
                    total_items: totalItems,
                    cantidad_productos: items.length
                }
            }
        });

    } catch (error) {
        console.error(" ERROR CRÍTICO en getActiveCart:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            details: error.message
        });
    }
};


const addToCart = async (req, res) => {
    console.log('=== INICIANDO addToCart ===');
    console.log('Body recibido:', req.body);

    try {
        const { id_usuario, id_producto, cantidad } = req.body;


        if (!id_usuario || !id_producto || !cantidad) {
            console.log(' Datos incompletos');
            return res.status(400).json({
                success: false,
                error: "Datos incompletos"
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({
                success: false,
                error: "La cantidad debe ser mayor a 0"
            });
        }


        const producto = await sequelize.query(`
            SELECT id_producto, nombre_producto, precio_unitario, estado_producto 
            FROM producto 
            WHERE id_producto = ? AND estado_producto = 'Activo'
        `, {
            replacements: [id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        if (!producto.length) {
            console.log(' Producto no encontrado:', id_producto);
            return res.status(404).json({
                success: false,
                error: "Producto no disponible"
            });
        }


        let carrito = await sequelize.query(`
            SELECT * FROM carrito 
            WHERE id_usuario = ?
            ORDER BY id_carrito DESC 
            LIMIT 1
        `, {
            replacements: [id_usuario],
            type: sequelize.QueryTypes.SELECT
        });

        let id_carrito;

        if (!carrito.length) {

            try {
                const nuevoCarrito = await sequelize.query(`
                    INSERT INTO carrito (id_usuario, estado_carrito) 
                    VALUES (?, 'Activo')
                `, {
                    replacements: [id_usuario],
                    type: sequelize.QueryTypes.INSERT
                });
                id_carrito = nuevoCarrito[0];
                console.log('Nuevo carrito creado:', id_carrito);
            } catch (insertError) {
                console.log('Error al crear carrito:', insertError.message);
                return res.status(500).json({
                    success: false,
                    error: "Error al crear carrito",
                    details: insertError.message
                });
            }
        } else {
            id_carrito = carrito[0].id_carrito;
            console.log('Carrito existente:', id_carrito, 'Estado:', carrito[0].estado_carrito);


            if (carrito[0].estado_carrito !== 'Activo') {
                await sequelize.query(`
                    UPDATE carrito 
                    SET estado_carrito = 'Activo', fecha_ultima_actualizacion = NOW()
                    WHERE id_carrito = ?
                `, {
                    replacements: [id_carrito],
                    type: sequelize.QueryTypes.UPDATE
                });
                console.log('Carrito reactivado');
            }
        }

        const precioUnitario = producto[0].precio_unitario;
        const subtotal = cantidad * precioUnitario;


        const itemExistente = await sequelize.query(`
            SELECT * FROM detalle_carrito 
            WHERE id_carrito = ? AND id_producto = ?
        `, {
            replacements: [id_carrito, id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        if (itemExistente.length) {

            const nuevaCantidad = parseInt(itemExistente[0].cantidad) + parseInt(cantidad);
            const nuevoSubtotal = nuevaCantidad * precioUnitario;

            await sequelize.query(`
                UPDATE detalle_carrito 
                SET cantidad = ?, subtotal = ?
                WHERE id_detalle_carrito = ?
            `, {
                replacements: [nuevaCantidad, nuevoSubtotal, itemExistente[0].id_detalle_carrito],
                type: sequelize.QueryTypes.UPDATE
            });
            console.log('✅ Producto actualizado en carrito');
        } else {

            await sequelize.query(`
                INSERT INTO detalle_carrito 
                (id_carrito, id_producto, cantidad, precio_unitario_al_momento, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, {
                replacements: [id_carrito, id_producto, cantidad, precioUnitario, subtotal],
                type: sequelize.QueryTypes.INSERT
            });
            console.log(' Nuevo producto agregado al carrito');
        }


        await sequelize.query(`
            UPDATE carrito 
            SET fecha_ultima_actualizacion = NOW() 
            WHERE id_carrito = ?
        `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log('=== addToCart COMPLETADO CON ÉXITO ===');

        res.json({
            success: true,
            message: "Producto agregado al carrito correctamente",
            data: {
                id_carrito: id_carrito,
                id_producto: id_producto,
                cantidad: cantidad
            }
        });

    } catch (error) {
        console.error(" ERROR en addToCart:", error);
        res.status(500).json({
            success: false,
            error: "Error al agregar producto",
            details: error.message
        });
    }
};


const getCartItemsCount = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const result = await sequelize.query(`
            SELECT COUNT(*) as total_items
            FROM detalle_carrito dc
            INNER JOIN carrito c ON dc.id_carrito = c.id_carrito
            WHERE c.id_usuario = ? AND c.estado_carrito = 'Activo'
        `, {
            replacements: [id_usuario],
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                total_items: result[0]?.total_items || 0
            }
        });
    } catch (error) {
        console.error("Error obteniendo número de items:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener número de items"
        });
    }
};


const updateCartItem = async (req, res) => {
    console.log('=== INICIANDO updateCartItem ===');
    const { id_item } = req.params;
    const { cantidad } = req.body;

    console.log('ID Item:', id_item, 'Nueva cantidad:', cantidad);

    try {

        if (cantidad === undefined || cantidad === null || cantidad < 0) {
            return res.status(400).json({
                success: false,
                error: "La cantidad debe ser mayor o igual a 0"
            });
        }


        const itemInfo = await sequelize.query(`
            SELECT 
                dc.id_detalle_carrito,
                dc.id_carrito,
                dc.id_producto,
                dc.cantidad as cantidad_actual,
                p.precio_unitario,
                p.nombre_producto,
                p.estado_producto
            FROM detalle_carrito dc
            INNER JOIN producto p ON dc.id_producto = p.id_producto
            WHERE dc.id_detalle_carrito = ?
        `, {
            replacements: [id_item],
            type: sequelize.QueryTypes.SELECT
        });

        if (!itemInfo.length) {
            console.log('❌ Item no encontrado:', id_item);
            return res.status(404).json({
                success: false,
                error: "Item del carrito no encontrado"
            });
        }


        if (cantidad === 0) {
            await sequelize.query(`
                DELETE FROM detalle_carrito 
                WHERE id_detalle_carrito = ?
            `, {
                replacements: [id_item],
                type: sequelize.QueryTypes.DELETE
            });

            console.log('✅ Item eliminado (cantidad = 0)');


            await sequelize.query(`
                UPDATE carrito 
                SET fecha_ultima_actualizacion = NOW() 
                WHERE id_carrito = ?
            `, {
                replacements: [itemInfo[0].id_carrito],
                type: sequelize.QueryTypes.UPDATE
            });

            return res.json({
                success: true,
                message: "Producto eliminado del carrito",
                data: {
                    id_item: id_item,
                    accion: 'eliminado'
                }
            });
        }


        const stockInfo = await sequelize.query(`
            SELECT 
                p.cantidad as stock_producto,
                i.cantidad_disponible as stock_inventario
            FROM producto p
            LEFT JOIN inventario i ON p.id_producto = i.id_producto
            WHERE p.id_producto = ?
        `, {
            replacements: [itemInfo[0].id_producto],
            type: sequelize.QueryTypes.SELECT
        });

        const stockDisponible = stockInfo[0]?.stock_inventario || stockInfo[0]?.stock_producto || 0;

        if (cantidad > stockDisponible) {
            console.log(' Stock insuficiente. Disponible:', stockDisponible, 'Solicitado:', cantidad);
            return res.status(400).json({
                success: false,
                error: `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles`
            });
        }

        const nuevoSubtotal = cantidad * itemInfo[0].precio_unitario;

        await sequelize.query(`
            UPDATE detalle_carrito 
            SET cantidad = ?, subtotal = ?
            WHERE id_detalle_carrito = ?
        `, {
            replacements: [cantidad, nuevoSubtotal, id_item],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log(' Cantidad actualizada:', cantidad, 'Subtotal:', nuevoSubtotal);


        await sequelize.query(`
            UPDATE carrito 
            SET fecha_ultima_actualizacion = NOW() 
            WHERE id_carrito = ?
        `, {
            replacements: [itemInfo[0].id_carrito],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log('=== updateCartItem COMPLETADO CON ÉXITO ===');

        res.json({
            success: true,
            message: "Cantidad actualizada correctamente",
            data: {
                id_item: id_item,
                nueva_cantidad: cantidad,
                nuevo_subtotal: nuevoSubtotal
            }
        });

    } catch (error) {
        console.error(" ERROR en updateCartItem:", error);
        res.status(500).json({
            success: false,
            error: "Error al actualizar cantidad",
            details: error.message
        });
    }
};


const deleteCartItem = async (req, res) => {
    console.log('=== INICIANDO deleteCartItem ===');
    const { id_item } = req.params;

    console.log('ID Item a eliminar:', id_item);

    try {

        const itemInfo = await sequelize.query(`
            SELECT id_carrito FROM detalle_carrito 
            WHERE id_detalle_carrito = ?
        `, {
            replacements: [id_item],
            type: sequelize.QueryTypes.SELECT
        });

        if (!itemInfo.length) {
            console.log(' Item no encontrado:', id_item);
            return res.status(404).json({
                success: false,
                error: "Item del carrito no encontrado"
            });
        }


        await sequelize.query(`
            DELETE FROM detalle_carrito 
            WHERE id_detalle_carrito = ?
        `, {
            replacements: [id_item],
            type: sequelize.QueryTypes.DELETE
        });

        console.log(' Item eliminado correctamente');


        await sequelize.query(`
            UPDATE carrito 
            SET fecha_ultima_actualizacion = NOW() 
            WHERE id_carrito = ?
        `, {
            replacements: [itemInfo[0].id_carrito],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log('=== deleteCartItem COMPLETADO CON ÉXITO ===');

        res.json({
            success: true,
            message: "Producto eliminado del carrito correctamente",
            data: {
                id_item: id_item
            }
        });

    } catch (error) {
        console.error(" ERROR en deleteCartItem:", error);
        res.status(500).json({
            success: false,
            error: "Error al eliminar producto del carrito",
            details: error.message
        });
    }
};


const clearCart = async (req, res) => {
    console.log('=== INICIANDO clearCart ===');
    const { id_carrito } = req.params;

    console.log('ID Carrito a vaciar:', id_carrito);

    try {

        const carrito = await sequelize.query(`
            SELECT id_carrito FROM carrito 
            WHERE id_carrito = ?
        `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.SELECT
        });

        if (!carrito.length) {
            console.log(' Carrito no encontrado:', id_carrito);
            return res.status(404).json({
                success: false,
                error: "Carrito no encontrado"
            });
        }


        await sequelize.query(`
            DELETE FROM detalle_carrito 
            WHERE id_carrito = ?
        `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.DELETE
        });

        console.log(' Carrito vaciado correctamente');


        await sequelize.query(`
            UPDATE carrito 
            SET fecha_ultima_actualizacion = NOW() 
            WHERE id_carrito = ?
        `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log('=== clearCart COMPLETADO CON ÉXITO ===');

        res.json({
            success: true,
            message: "Carrito vaciado correctamente",
            data: {
                id_carrito: id_carrito
            }
        });

    } catch (error) {
        console.error(" ERROR en clearCart:", error);
        res.status(500).json({
            success: false,
            error: "Error al vaciar el carrito",
            details: error.message
        });
    }
};


const getCartSummary = async (req, res) => {
    try {
        const { id_carrito } = req.params;

        console.log('Obteniendo resumen para carrito:', id_carrito);

        const result = await sequelize.query(`
            SELECT 
                COUNT(*) as cantidad_productos,
                SUM(cantidad) as total_items,
                SUM(subtotal) as subtotal
            FROM detalle_carrito
            WHERE id_carrito = ?
        `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.SELECT
        });

        const resumen = result[0] || {
            cantidad_productos: 0,
            total_items: 0,
            subtotal: 0
        };

        console.log('Resumen obtenido:', resumen);

        res.json({
            success: true,
            data: resumen
        });

    } catch (error) {
        console.error("Error obteniendo resumen del carrito:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener resumen del carrito"
        });
    }
};


module.exports = {
    getActiveCart,
    addToCart,
    getCartItemsCount,
    updateCartItem,
    deleteCartItem,
    clearCart,
    getCartSummary
};