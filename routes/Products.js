const express = require('express');
const router = express.Router();
const { 
  Producto, 
  ComentarioResena, 
  Usuario, 
  Subcategoria, 
  Categoria,
  ProductoDescuento,
  Descuento,
  Sequelize 
} = require('../models'); 

const { Op } = require('sequelize');

router.get('/mejores-calificados', async (req, res) => {
  try {
    const ratingSubquery = `
      SELECT 
        cr.id_producto,
        AVG(cr.calificacion) as rating_promedio,
        COUNT(cr.id_comentario_resena) as total_votos
      FROM comentario_resena cr
      WHERE cr.estado_comentario = 'Aprobado'
      GROUP BY cr.id_producto
    `;

    const products = await Producto.findAll({
      attributes: [
        'id_producto',
        'nombre_producto',
        'descripcion_producto',
        'precio_unitario',
        'unidad_medida',
        'url_imagen',
        'cantidad',
        'estado_producto',
        'fecha_creacion',
        [Sequelize.literal('COALESCE(r.rating_promedio, 0)'), 'rating_promedio'],
        [Sequelize.literal('COALESCE(r.total_votos, 0)'), 'total_votos'],
        [Sequelize.literal(`
          CASE 
            WHEN producto.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 
            ELSE 0 
          END
        `), 'esNuevo']
      ],
      include: [
        {
          model: Subcategoria,
          attributes: ['nombre'],
          include: [{
            model: Categoria,
            attributes: [['nombre_categoria', 'categoria']]
          }]
        },
        {
          model: ProductoDescuento,
          attributes: [],
          include: [{
            model: Descuento,
            attributes: [],
            where: {
              activo: true,
              fecha_inicio: { [Op.lte]: Sequelize.fn('NOW') },
              fecha_fin: { [Op.gte]: Sequelize.fn('NOW') }
            },
            required: false
          }]
        }
      ],
      where: {
        estado_producto: 'Activo',
        cantidad: { [Op.gt]: 0 }
      },
      having: {
        'rating_promedio': { [Op.gte]: 4.0 }
      },
      order: [
        [Sequelize.literal('rating_promedio'), 'DESC'],
        [Sequelize.literal('total_votos'), 'DESC']
      ],
      limit: 6,
      subQuery: false,
      includeIgnoreAttributes: false,
      raw: false
    });

    const productsWithComments = await Promise.all(
      products.map(async (product) => {
        const comentarios = await ComentarioResena.findAll({
          where: {
            id_producto: product.id_producto,
            estado_comentario: 'Aprobado'
          },
          include: [{
            model: Usuario,
            attributes: ['nombre_usuario', 'correo_electronico']
          }],
          order: [['fecha_creacion', 'DESC']],
          limit: 5
        });

        const descuentoActivo = await ProductoDescuento.findOne({
          where: { id_producto: product.id_producto },
          include: [{
            model: Descuento,
            where: {
              activo: true,
              fecha_inicio: { [Op.lte]: Sequelize.fn('NOW') },
              fecha_fin: { [Op.gte]: Sequelize.fn('NOW') }
            }
          }]
        });

        return {
          id_producto: product.id_producto,
          nombre_producto: product.nombre_producto,
          descripcion_producto: product.descripcion_producto,
          precio_unitario: parseFloat(product.precio_unitario),
          unidad_medida: product.unidad_medida,
          url_imagen: product.url_imagen,
          cantidad: product.cantidad,
          estado_producto: product.estado_producto,
          categoria: product.Subcategoria?.Categoria?.categoria,
          subcategoria: product.Subcategoria?.nombre,
          rating: parseFloat(product.get('rating_promedio')),
          votos: parseInt(product.get('total_votos')),
          comentarios: comentarios.map(comentario => ({
            calificacion: comentario.calificacion,
            texto_comentario: comentario.texto_comentario,
            fecha_creacion: comentario.fecha_creacion,
            usuario: {
              nombre_usuario: comentario.Usuario.nombre_usuario,
              correo_electronico: comentario.Usuario.correo_electronico
            }
          })),
          descuento: descuentoActivo ? parseFloat(descuentoActivo.Descuento.valor_descuento) : 0,
          esNuevo: Boolean(product.get('esNuevo'))
        };
      })
    );

    res.json(productsWithComments);
  } catch (error) {
    console.error('Error fetching best products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/mejores-calificados-optimizado', async (req, res) => {
  try {
    const products = await Producto.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT AVG(cr.calificacion)
              FROM comentario_resena cr
              WHERE cr.id_producto = producto.id_producto
              AND cr.estado_comentario = 'Aprobado'
            )`),
            'rating_promedio'
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM comentario_resena cr
              WHERE cr.id_producto = producto.id_producto
              AND cr.estado_comentario = 'Aprobado'
            )`),
            'total_votos'
          ],
          [
            Sequelize.literal(`(
              SELECT d.valor_descuento
              FROM producto_descuento pd
              JOIN descuentos d ON pd.id_descuento = d.id_descuento
              WHERE pd.id_producto = producto.id_producto
              AND d.activo = true
              AND d.fecha_inicio <= NOW()
              AND d.fecha_fin >= NOW()
              LIMIT 1
            )`),
            'descuento'
          ],
          [
            Sequelize.literal(`(
              CASE 
                WHEN producto.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN true
                ELSE false
              END
            )`),
            'esNuevo'
          ]
        ]
      },
      include: [
        {
          model: Subcategoria,
          attributes: ['nombre'],
          include: [{
            model: Categoria,
            attributes: [['nombre_categoria', 'categoria']]
          }]
        },
        {
          model: ComentarioResena,
          as: 'comentarios',
          where: { estado_comentario: 'Aprobado' },
          required: false,
          include: [{
            model: Usuario,
            attributes: ['nombre_usuario', 'correo_electronico']
          }]
        }
      ],
      where: {
        estado_producto: 'Activo',
        cantidad: { [Op.gt]: 0 }
      },
      having: Sequelize.literal('rating_promedio >= 4.0'),
      order: [
        [Sequelize.literal('rating_promedio'), 'DESC'],
        [Sequelize.literal('total_votos'), 'DESC']
      ],
      limit: 6,
      subQuery: false
    });

    const formattedProducts = products.map(product => ({
      id_producto: product.id_producto,
      nombre_producto: product.nombre_producto,
      descripcion_producto: product.descripcion_producto,
      precio_unitario: parseFloat(product.precio_unitario),
      unidad_medida: product.unidad_medida,
      url_imagen: product.url_imagen,
      cantidad: product.cantidad,
      estado_producto: product.estado_producto,
      categoria: product.Subcategoria?.Categoria?.categoria,
      subcategoria: product.Subcategoria?.nombre,
      rating: parseFloat(product.get('rating_promedio')) || 0,
      votos: parseInt(product.get('total_votos')) || 0,
      comentarios: product.comentarios?.map(comentario => ({
        calificacion: comentario.calificacion,
        texto_comentario: comentario.texto_comentario,
        fecha_creacion: comentario.fecha_creacion,
        usuario: {
          nombre_usuario: comentario.Usuario.nombre_usuario,
          correo_electronico: comentario.Usuario.correo_electronico
        }
      })) || [],
      descuento: parseFloat(product.get('descuento')) || 0,
      esNuevo: Boolean(product.get('esNuevo'))
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching best products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;