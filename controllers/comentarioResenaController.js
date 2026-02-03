const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

const getUserId = (req) => req.user?.id_usuario || req.usuario?.id;

const getComentariosYResenasByProductor = async (req, res) => {
  const id_productor = getUserId(req);
  const categoriaId = req.query.categoriaId;

  if (!id_productor) {
    return res.status(401).json({ error: "Usuario no autenticado." });
  }

  try {
    let sqlQuery = `
      SELECT 
        c.id_comentario_resena AS id_comentario,
        c.texto_comentario AS comentario,
        c.calificacion,
        c.fecha_creacion AS fecha_comentario,
        p.id_producto,
        p.nombre_producto,
        p.url_imagen,
        u.nombre_usuario AS nombre_cliente
      FROM comentario_resena c                 
      INNER JOIN producto p ON c.id_producto = p.id_producto
      INNER JOIN inventario i ON i.id_producto = p.id_producto
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      INNER JOIN subcategoria sc ON p.id_SubCategoria = sc.id_SubCategoria 
      INNER JOIN categorias cat ON sc.id_categoria = cat.id_categoria
      WHERE i.id_agricultor = ?
    `;

    const replacements = [id_productor];

    if (categoriaId) {
      const catIdNumber = parseInt(categoriaId);
      if (!isNaN(catIdNumber)) {
        sqlQuery += ` AND cat.id_categoria = ?`;
        replacements.push(catIdNumber);
      }
    }

    sqlQuery += ` ORDER BY c.fecha_creacion DESC;`;

    const resultados = await sequelize.query(sqlQuery, {
      replacements: replacements,
      type: QueryTypes.SELECT,
    });

    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener comentarios y reseñas con filtro:", error);
    res.status(500).json({
      error: "Error al cargar los comentarios y reseñas.",
    });
  }
};

module.exports = { getComentariosYResenasByProductor };
