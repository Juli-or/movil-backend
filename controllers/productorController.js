const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

const getUserId = (req) => req.user?.id_usuario || req.usuario?.id;

const createProducto = async (req, res) => {
  const {
    nombre_producto,
    descripcion_producto,
    precio_unitario,
    unidad_medida,
    url_imagen,
    id_SubCategoria,
    cantidad,
  } = req.body;

  const id_usuario = getUserId(req);
  if (!id_usuario)
    return res.status(401).json({ error: "Usuario no autenticado." });

  try {
    console.log('[CONTROLLER] Creating product for user:', id_usuario);

    const result = await sequelize.transaction(async (t) => {
      const insertQuery = `
        INSERT INTO producto 
        (nombre_producto, descripcion_producto, precio_unitario, unidad_medida, url_imagen, id_SubCategoria, estado_producto)
        VALUES (?, ?, ?, ?, ?, ?, 'Activo');
      `;

      const insertResult = await sequelize.query(insertQuery, {
        replacements: [
          nombre_producto,
          descripcion_producto,
          precio_unitario,
          unidad_medida,
          url_imagen,
          id_SubCategoria,
        ],
        transaction: t,
      });

      console.log(' [CONTROLLER] Insert result:', insertResult);

      let id_producto_insertado;

      if (insertResult && insertResult[0] && insertResult[0].insertId) {
        id_producto_insertado = insertResult[0].insertId;
      } else if (insertResult && insertResult[0] && typeof insertResult[0] === 'number') {
        id_producto_insertado = insertResult[0];
      } else {
        const [lastIdResult] = await sequelize.query(
          "SELECT LAST_INSERT_ID() as id_producto",
          {
            transaction: t,
            type: QueryTypes.SELECT
          }
        );
        id_producto_insertado = lastIdResult.id_producto;
      }

      console.log('📦 [CONTROLLER] Extracted product ID:', id_producto_insertado);

      if (!id_producto_insertado) {
        throw new Error("No se pudo obtener el ID del producto insertado.");
      }

      const insertInventoryQuery = `
        INSERT INTO inventario (id_producto, id_agricultor, cantidad_disponible) 
        VALUES (?, ?, ?)
      `;

      await sequelize.query(insertInventoryQuery, {
        replacements: [id_producto_insertado, id_usuario, cantidad],
        transaction: t,
      });

      return id_producto_insertado;
    });

    console.log(' [CONTROLLER] Product created successfully, ID:', result);

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id_producto: result,
      success: true
    });

  } catch (error) {
    console.error(" [CONTROLLER] Error creating product:", error);
    res.status(500).json({
      error: "No se pudo registrar el producto: " + error.message,
      success: false
    });
  }
};

const getProductosByUserId = async (req, res) => {
  const { id_usuario } = req.params;

  if (isNaN(parseInt(id_usuario))) {
    return res.status(400).json({ error: "ID de usuario inválido." });
  }

  try {
    console.log(' [CONTROLLER] Getting products for user:', id_usuario);

    const productos = await sequelize.query(
      `
SELECT 
  p.id_producto, 
  p.nombre_producto, 
  p.descripcion_producto, 
  p.precio_unitario, 
  p.unidad_medida, 
  p.url_imagen, 
  p.id_SubCategoria, 
  p.estado_producto,
  i.id_agricultor AS id_usuario, 
  i.cantidad_disponible 
FROM producto p
INNER JOIN inventario i ON p.id_producto = i.id_producto
WHERE i.id_agricultor = ? AND p.estado_producto = 'Activo';
      `,
      {
        replacements: [id_usuario],
        type: QueryTypes.SELECT,
      }
    );

    console.log(' [CONTROLLER] Products found:', productos.length);
    res.json(productos);

  } catch (error) {
    console.error(" [CONTROLLER] Error getting products:", error);
    res.status(500).json({ error: "Error al cargar los productos." });
  }
};

const updateProducto = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_producto,
    descripcion_producto,
    precio_unitario,
    unidad_medida,
    url_imagen,
    cantidad,
  } = req.body;

  const id_usuario = getUserId(req);
  if (!id_usuario)
    return res.status(401).json({ error: "Usuario no autenticado." });

  const t = await sequelize.transaction();

  try {
    console.log(' [CONTROLLER] Updating product:', id);

    const [productExists] = await sequelize.query(
      `SELECT 1 FROM inventario WHERE id_producto = ? AND id_agricultor = ?`,
      {
        replacements: [id, id_usuario],
        transaction: t,
        type: QueryTypes.SELECT
      }
    );

    if (!productExists) {
      await t.rollback();
      return res.status(404).json({
        error: "Producto no encontrado o no autorizado para actualizar.",
        success: false
      });
    }

    const [updateProductResult] = await sequelize.query(
      `
UPDATE producto 
SET nombre_producto = ?, 
    descripcion_producto = ?, 
    precio_unitario = ?, 
    unidad_medida = ?, 
    url_imagen = ?
WHERE id_producto = ?;
      `,
      {
        replacements: [
          nombre_producto,
          descripcion_producto,
          precio_unitario,
          unidad_medida,
          url_imagen,
          id
        ],
        transaction: t,
      }
    );

    console.log(' [CONTROLLER] Product update result:', updateProductResult);

    if (cantidad !== undefined && cantidad !== null) {
      console.log(' [CONTROLLER] Updating inventory quantity:', cantidad);
      await sequelize.query(
        `
UPDATE inventario
SET cantidad_disponible = ?,
    fecha_ultima_actualizacion = NOW()
WHERE id_producto = ?;
        `,
        {
          replacements: [cantidad, id],
          transaction: t,
        }
      );
    }

    await t.commit();
    console.log(' [CONTROLLER] Product updated successfully');

    res.json({
      mensaje: "Producto actualizado correctamente",
      success: true
    });

  } catch (error) {
    await t.rollback();
    console.error(" [CONTROLLER] Error updating product:", error);
    res.status(500).json({
      error: "No se pudo actualizar el producto: " + error.message,
      success: false
    });
  }
};


const deactivateProducto = async (req, res) => {
  const { id } = req.params;
  const id_usuario = getUserId(req);

  if (!id_usuario)
    return res.status(401).json({ error: "Usuario no autenticado." });

  const t = await sequelize.transaction();

  try {
    console.log('[CONTROLLER] Deactivating product:', id);

    const [productExists] = await sequelize.query(
      `SELECT 1 FROM inventario WHERE id_producto = ? AND id_agricultor = ?`,
      {
        replacements: [id, id_usuario],
        transaction: t,
        type: QueryTypes.SELECT
      }
    );

    if (!productExists) {
      await t.rollback();
      return res.status(404).json({
        error: "Producto no encontrado o no autorizado para desactivar.",
        success: false
      });
    }

    const [updateResult] = await sequelize.query(
      `UPDATE producto SET estado_producto = 'Inactivo' WHERE id_producto = ?;`,
      {
        replacements: [id],
        transaction: t,
      }
    );

    console.log(' [CONTROLLER] Deactivation result:', updateResult);

    await t.commit();
    console.log(' [CONTROLLER] Product deactivated successfully');

    res.json({
      mensaje: "Producto desactivado correctamente",
      success: true
    });

  } catch (error) {
    await t.rollback();
    console.error(" [CONTROLLER] Error deactivating product:", error);
    res.status(500).json({
      error: "No se pudo desactivar el producto: " + error.message,
      success: false
    });
  }
};


const getAllProductos = async (req, res) => {
  try {
    console.log(' [CONTROLLER] Getting all products');

    const productos = await sequelize.query(
      `
SELECT 
  p.id_producto, 
  p.nombre_producto, 
  p.descripcion_producto, 
  p.precio_unitario, 
  p.unidad_medida, 
  p.url_imagen, 
  p.id_SubCategoria, 
  p.estado_producto,
  i.id_agricultor AS id_usuario, 
  i.cantidad_disponible 
FROM producto p
INNER JOIN inventario i ON p.id_producto = i.id_producto
WHERE p.estado_producto = 'Activo';
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    console.log(' [CONTROLLER] All products found:', productos.length);
    res.json(productos);

  } catch (error) {
    console.error(" [CONTROLLER] Error getting all products:", error);
    res.status(500).json({ error: "Error al cargar todos los productos." });
  }
};


module.exports = {
  createProducto,
  getProductosByUserId,
  getAllProductos,
  updateProducto,
  deactivateProducto,
};