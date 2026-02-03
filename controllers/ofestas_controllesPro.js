const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

const getUserId = (req) => req.user?.id_usuario || req.usuario?.id || req.query.id_usuario;


const getAllPromocionesByProductorId = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    const includeDeleted = req.query.includeDeleted === 'true';

    if (!id_usuario) return res.status(401).json({ error: "Usuario no autenticado." });

    // Consulta completa que incluye Productos, Ofertas y Descuentos del agricultor
    let sql = `
      SELECT 
        -- 1. Información del Producto
        P.id_producto,
        P.nombre_producto AS producto,
        P.precio_unitario AS precio_original,
        P.url_imagen,
        
        -- 2. Información del Agricultor (Productor)
        A.id_usuario AS id_agricultor,
        A.nombre_usuario AS nombre_agricultor,
        
        -- 3. Información de la Oferta
        O.id_oferta,
        O.nombre_oferta,
        O.tipo_oferta,
        DATE_FORMAT(O.fecha_inicio, '%Y-%m-%d') AS oferta_fecha_inicio,
        DATE_FORMAT(O.fecha_fin, '%Y-%m-%d') AS oferta_fecha_fin,
        O.descripcion_oferta AS detalles_oferta,
        
        -- 4. Información del Descuento
        D.id_descuento AS id_promocion,
        D.nombre_descuento AS nombre,
        DATE_FORMAT(D.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
        DATE_FORMAT(D.fecha_fin, '%Y-%m-%d') AS fecha_fin,
        D.valor_descuento AS porcentaje_descuento,
        COALESCE(D.estado, 'Pendiente') AS estado,
        'Descuento' AS tipo_deal
        
      FROM 
        producto P
        
      -- Enlazar con el Agricultor (Usuarios)
      JOIN 
        usuarios A ON P.id_usuario = A.id_usuario 

      -- Enlazar con Ofertas (LEFT JOIN para incluir productos sin oferta)
      LEFT JOIN 
        producto_oferta PO ON P.id_producto = PO.id_producto
      LEFT JOIN 
        ofertas O ON PO.id_oferta = O.id_oferta

      -- Enlazar con Descuentos (LEFT JOIN para incluir productos sin descuento)
      LEFT JOIN 
        producto_descuento PD ON P.id_producto = PD.id_producto
      LEFT JOIN 
        descuentos D ON PD.id_descuento = D.id_descuento
      
      WHERE 
        A.id_usuario = :id_usuario
    `;

    // Si no incluye eliminadas, excluir las que tengan estado "Eliminada"
    if (!includeDeleted) {
      sql += ` AND (D.estado IS NULL OR D.estado != 'Eliminada')`;
    }

    sql += `
      ORDER BY 
        P.nombre_producto ASC, 
        oferta_fecha_inicio DESC, 
        fecha_inicio DESC;
    `;

    const data = await sequelize.query(sql, {
      replacements: { id_usuario },
      type: QueryTypes.SELECT,
    });

    res.json(data);
  } catch (error) {
    console.error(" Error al obtener promociones:", error);
    res.status(500).json({ error: "Error al obtener promociones" });
  }
};

const createDescuento = async (req, res) => {
  const id_usuario = req.user?.id_usuario;
  const { idProducto, porcentaje, fechaInicio, fechaFin } = req.body;

  if (!id_usuario)
    return res.status(401).json({ error: "Usuario no autenticado." });

  try {

    const [producto] = await sequelize.query(
      `SELECT p.id_producto, i.id_agricultor 
       FROM producto p
       INNER JOIN inventario i ON p.id_producto = i.id_producto
       WHERE p.id_producto = :idProducto AND i.id_agricultor = :id_usuario`,
      { replacements: { idProducto, id_usuario }, type: QueryTypes.SELECT }
    );

    if (!producto)
      return res
        .status(404)
        .json({ error: "Producto no encontrado o no pertenece al productor." });

    const estado = "Pendiente";



    const nombre_descuento = `Descuento ${porcentaje}`;
    const tipo_descuento = "Porcentaje";

    const t = await sequelize.transaction();
    try {
      const insertDesc = `
        INSERT INTO descuentos (id_productor, nombre_descuento, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin, codigo_descuento, activo)
        VALUES (:id_usuario, :nombre_descuento, :tipo_descuento, :porcentaje, :fechaInicio, :fechaFin, NULL, 1);
      `;

      await sequelize.query(insertDesc, {
        replacements: { id_usuario, nombre_descuento, tipo_descuento, porcentaje, fechaInicio, fechaFin },
        transaction: t,
      });

      const linkSql = `
        INSERT INTO producto_descuento (id_producto, id_descuento)
        VALUES (:idProducto, LAST_INSERT_ID());
      `;
      await sequelize.query(linkSql, { replacements: { idProducto }, transaction: t });

  
      const [{ lastId }] = await sequelize.query("SELECT LAST_INSERT_ID() as lastId;", { transaction: t, type: QueryTypes.SELECT });

      await t.commit();

      res.json({ mensaje: "Descuento creado correctamente.", id_descuento: lastId });
      return;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    console.error(" Error al crear descuento:", error);
    res.status(500).json({ error: "Error al crear descuento" });
  }
};



const updateDescuento = async (req, res) => {
  const id_usuario = req.user?.id_usuario;
  const { idDescuento } = req.params;
  const { porcentaje, fechaInicio, fechaFin, estado } = req.body;

  if (!id_usuario)
    return res.status(401).json({ error: "Usuario no autenticado." });

  try {
    const sql = `
      UPDATE descuentos
      SET valor_descuento = :porcentaje, fecha_inicio = :fechaInicio,
          fecha_fin = :fechaFin, estado = :estado
      WHERE id_descuento = :idDescuento;
    `;
    await sequelize.query(sql, {
      replacements: { porcentaje, fechaInicio, fechaFin, estado, idDescuento },
    });

    res.json({ mensaje: "Descuento actualizado correctamente." });
  } catch (error) {
    console.error(" Error al actualizar descuento:", error);
    res.status(500).json({ error: "Error al actualizar descuento" });
  }
};

const deleteDescuento = async (req, res) => {
  const id_usuario = req.user?.id_usuario;
  const { idDescuento } = req.params;

  if (!id_usuario)
    return res.status(401).json({ error: "Usuario no autenticado." });

  try {
    // Marcar como eliminada en lugar de eliminar físicamente
    const sql = `
      UPDATE descuentos
      SET estado = 'Eliminada'
      WHERE id_descuento = :idDescuento;
    `;
    
    await sequelize.query(sql, {
      replacements: { idDescuento },
    });

    res.json({ mensaje: "Descuento eliminado correctamente." });
  } catch (error) {
    console.error(" Error al eliminar descuento:", error);
    res.status(500).json({ error: "Error al eliminar descuento" });
  }
};

module.exports = {
  getAllPromocionesByProductorId,
  createDescuento,
  updateDescuento,
  deleteDescuento,
};
