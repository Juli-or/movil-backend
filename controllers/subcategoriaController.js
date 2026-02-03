const sequelize = require("../config/db"); 
const { QueryTypes } = require("sequelize");

const getAllSubcategorias = async (req, res) => {
  try {
    const subcategorias = await sequelize.query(
      `
      SELECT 
        sc.id_SubCategoria, 
        sc.nombre as nombre_subcategoria,
        cat.nombre_categoria
      FROM SubCategoria sc
      INNER JOIN categorias cat ON sc.id_categoria = cat.id_categoria
      ORDER BY cat.nombre_categoria, sc.nombre;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json(subcategorias);
  } catch (error) {
    console.error(" Error al obtener subcategorías:", error);
    res.status(500).json({
      error: "Error al cargar las subcategorías en el servidor.",
      details: error.original ? error.original.sqlMessage : error.message
    });
  }
};

module.exports = { getAllSubcategorias };
