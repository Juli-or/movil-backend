const sequelize = require('../config/db');

const crearPedido = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            id_usuario,
            id_metodo_pago,
            direccion_envio,
            ciudad_envio,
            codigo_postal_envio,
            notas_pedido,
            total_pedido
        } = req.body;

        if (!id_usuario || !id_metodo_pago || !direccion_envio || !ciudad_envio) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                error: "Datos incompletos: id_usuario, id_metodo_pago, direccion_envio y ciudad_envio son requeridos"
            });
        }

        const carrito = await sequelize.query(`
      SELECT id_carrito FROM carrito 
      WHERE id_usuario = ? AND estado_carrito = 'Activo'
    `, {
            replacements: [id_usuario],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (!carrito.length) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                error: "No se encontró carrito activo"
            });
        }

        const id_carrito = carrito[0].id_carrito;

        const itemsCarrito = await sequelize.query(`
      SELECT 
        dc.id_detalle_carrito,
        dc.id_producto,
        dc.cantidad,
        dc.precio_unitario_al_momento,
        dc.subtotal,
        p.nombre_producto,
        p.cantidad as stock_disponible,
        p.url_imagen
      FROM detalle_carrito dc
      INNER JOIN producto p ON dc.id_producto = p.id_producto
      WHERE dc.id_carrito = ?
    `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (!itemsCarrito.length) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                error: "El carrito está vacío"
            });
        }

        for (const item of itemsCarrito) {
            if (item.cantidad > item.stock_disponible) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    error: `Stock insuficiente para ${item.nombre_producto}. Disponible: ${item.stock_disponible}`
                });
            }
        }

        const numeroSeguimiento = `AGRO-${Date.now().toString().slice(-8)}`;

        const pedidoResult = await sequelize.query(`
      INSERT INTO pedidos (
        id_usuario, 
        id_metodo_pago, 
        direccion_envio, 
        ciudad_envio, 
        codigo_postal_envio, 
        notas_pedido, 
        total_pedido, 
        id_estado_pedido,
        numero_seguimiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
            replacements: [
                id_usuario,
                id_metodo_pago,
                direccion_envio,
                ciudad_envio,
                codigo_postal_envio || '',
                notas_pedido || '',
                total_pedido,
                1,
                numeroSeguimiento
            ],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        const id_pedido = pedidoResult[0];

        for (const item of itemsCarrito) {
            await sequelize.query(`
        INSERT INTO detalle_pedido (
          id_pedido,
          id_producto,
          cantidad,
          precio_unitario_al_momento,
          subtotal
        ) VALUES (?, ?, ?, ?, ?)
      `, {
                replacements: [
                    id_pedido,
                    item.id_producto,
                    item.cantidad,
                    item.precio_unitario_al_momento,
                    item.subtotal
                ],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        }

        await sequelize.query(`
      UPDATE carrito 
      SET estado_carrito = 'Completado', fecha_ultima_actualizacion = NOW()
      WHERE id_carrito = ?
    `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        await sequelize.query(`
      DELETE FROM detalle_carrito WHERE id_carrito = ?
    `, {
            replacements: [id_carrito],
            type: sequelize.QueryTypes.DELETE,
            transaction
        });

        await transaction.commit();

        const pedidoCreado = await sequelize.query(`
      SELECT 
        p.*,
        mp.nombre_metodo,
        ep.nombre_estado,
        u.nombre_usuario
      FROM pedidos p
      LEFT JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      LEFT JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_pedido = ?
    `, {
            replacements: [id_pedido],
            type: sequelize.QueryTypes.SELECT
        });

        const detallesPedido = await sequelize.query(`
      SELECT 
        dp.*,
        p.nombre_producto,
        p.url_imagen,
        p.unidad_medida
      FROM detalle_pedido dp
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      WHERE dp.id_pedido = ?
    `, {
            replacements: [id_pedido],
            type: sequelize.QueryTypes.SELECT
        });

        const respuesta = {
            ...pedidoCreado[0],
            detalles: detallesPedido,
            items: detallesPedido
        };

        res.json({
            success: true,
            message: "Pedido creado exitosamente",
            data: respuesta
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error creando pedido:", error);

        let errorMessage = "Error al crear el pedido";
        if (error.name === 'SequelizeDatabaseError') {
            if (error.parent && error.parent.code === 'ER_BAD_FIELD_ERROR') {
                errorMessage = "Error en la base de datos: Columna no encontrada. Verifica la estructura de la tabla pedidos.";
            } else {
                errorMessage = `Error de base de datos: ${error.message}`;
            }
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.message
        });
    }
};


const obtenerPedidosUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const pedidos = await sequelize.query(`
      SELECT 
        p.*,
        mp.nombre_metodo,
        ep.nombre_estado
      FROM pedidos p
      LEFT JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      LEFT JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
      WHERE p.id_usuario = ?
      ORDER BY p.fecha_pedido DESC
    `, {
            replacements: [id_usuario],
            type: sequelize.QueryTypes.SELECT
        });

        for (let pedido of pedidos) {
            const detalles = await sequelize.query(`
        SELECT 
          dp.*,
          p.nombre_producto,
          p.url_imagen,
          p.unidad_medida
        FROM detalle_pedido dp
        INNER JOIN producto p ON dp.id_producto = p.id_producto
        WHERE dp.id_pedido = ?
      `, {
                replacements: [pedido.id_pedido],
                type: sequelize.QueryTypes.SELECT
            });

            pedido.detalles = detalles;
            pedido.items = detalles;
        }

        res.json({
            success: true,
            data: pedidos
        });

    } catch (error) {
        console.error("Error obteniendo pedidos:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener los pedidos"
        });
    }
};


const obtenerDetallePedido = async (req, res) => {
    try {
        const { id_pedido } = req.params;

        const pedido = await sequelize.query(`
      SELECT 
        p.*,
        mp.nombre_metodo,
        ep.nombre_estado,
        u.nombre_usuario
      FROM pedidos p
      LEFT JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      LEFT JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_pedido = ?
    `, {
            replacements: [id_pedido],
            type: sequelize.QueryTypes.SELECT
        });

        if (!pedido.length) {
            return res.status(404).json({
                success: false,
                error: "Pedido no encontrado"
            });
        }

        const detalles = await sequelize.query(`
      SELECT 
        dp.*,
        p.nombre_producto,
        p.url_imagen,
        p.unidad_medida,
        p.descripcion_producto
      FROM detalle_pedido dp
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      WHERE dp.id_pedido = ?
    `, {
            replacements: [id_pedido],
            type: sequelize.QueryTypes.SELECT
        });

        const respuesta = {
            ...pedido[0],
            detalles: detalles,
            items: detalles
        };

        res.json({
            success: true,
            data: respuesta
        });

    } catch (error) {
        console.error("Error obteniendo detalle del pedido:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener el detalle del pedido"
        });
    }
};


const cancelarPedido = async (req, res) => {
    try {
        const { id_pedido } = req.params;
        const { motivo_cancelacion } = req.body;

        const pedido = await sequelize.query(`
      SELECT p.*, ep.nombre_estado 
      FROM pedidos p
      LEFT JOIN estado_pedido ep ON p.id_estado_pedido = ep.id_estado_pedido
      WHERE p.id_pedido = ?
    `, {
            replacements: [id_pedido],
            type: sequelize.QueryTypes.SELECT
        });

        if (!pedido.length) {
            return res.status(404).json({
                success: false,
                error: "Pedido no encontrado"
            });
        }

        if (pedido[0].id_estado_pedido !== 1) {
            return res.status(400).json({
                success: false,
                error: `El pedido no se puede cancelar porque ya está ${pedido[0].nombre_estado.toLowerCase()}`
            });
        }

        let updateQuery;
        let updateParams;

        try {
            updateQuery = `
        UPDATE pedidos 
        SET id_estado_pedido = 4, 
            fecha_actualizacion = NOW(),
            motivo_cancelacion = ?
        WHERE id_pedido = ?
      `;
            updateParams = [motivo_cancelacion || 'Cancelado por el usuario', id_pedido];
        } catch (error) {
            updateQuery = `
        UPDATE pedidos 
        SET id_estado_pedido = 4, 
            fecha_actualizacion = NOW()
        WHERE id_pedido = ?
      `;
            updateParams = [id_pedido];
        }

        const updateResult = await sequelize.query(updateQuery, {
            replacements: updateParams,
            type: sequelize.QueryTypes.UPDATE
        });

        if (updateResult[0] === 0) {
            return res.status(500).json({
                success: false,
                error: "No se pudo actualizar el estado del pedido"
            });
        }

        try {
            const detallesPedido = await sequelize.query(`
        SELECT * FROM detalle_pedido WHERE id_pedido = ?
      `, {
                replacements: [id_pedido],
                type: sequelize.QueryTypes.SELECT
            });

            for (const detalle of detallesPedido) {
                await sequelize.query(`
          UPDATE producto 
          SET cantidad = cantidad + ? 
          WHERE id_producto = ?
        `, {
                    replacements: [detalle.cantidad, detalle.id_producto],
                    type: sequelize.QueryTypes.UPDATE
                });
            }
        } catch (stockError) {
            console.error('No se pudo restaurar el stock:', stockError.message);
        }

        res.json({
            success: true,
            message: "Pedido cancelado exitosamente",
            data: {
                id_pedido: parseInt(id_pedido),
                numero_seguimiento: pedido[0].numero_seguimiento,
                nuevo_estado: "Cancelado",
                motivo: motivo_cancelacion || 'Cancelado por el usuario'
            }
        });

    } catch (error) {
        console.error("ERROR CRÍTICO cancelando pedido:", error);

        let errorMessage = "Error interno del servidor al cancelar el pedido";

        if (error.name === 'SequelizeDatabaseError' && error.parent) {
            if (error.parent.code === 'ER_BAD_FIELD_ERROR') {
                errorMessage = "Error: Columna no encontrada en la base de datos";
            } else if (error.parent.code === 'ER_NO_SUCH_TABLE') {
                errorMessage = "Error: Tabla no encontrada en la base de datos";
            } else {
                errorMessage = `Error de base de datos: ${error.parent.sqlMessage}`;
            }
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.message,
            sqlError: error.parent ? {
                code: error.parent.code,
                message: error.parent.sqlMessage,
                sql: error.parent.sql
            } : null
        });
    }
};


module.exports = {
    crearPedido,
    obtenerPedidosUsuario,
    obtenerDetallePedido,
    cancelarPedido
};
