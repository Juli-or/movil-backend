const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getUserId = (req) => {
  return req.user?.id_usuario || req.usuario?.id_usuario || req.query.id_usuario;
};

const getDatosFinancieros = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    const estadoEntregado = await sequelize.query(
      "SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = 'Entregado' LIMIT 1",
      { type: QueryTypes.SELECT }
    );

    if (!estadoEntregado.length) {
      return res.status(500).json({ error: "Estado 'Entregado' no encontrado." });
    }

    const idEstadoEntregado = estadoEntregado[0].id_estado_pedido;

    const ingresos = await sequelize.query(
      `
      SELECT 
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as ingresos_totales,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as ventas_pendientes
      FROM detalle_pedido dp
      INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      WHERE p.id_usuario = :id_usuario
      `,
      {
        replacements: { id_usuario, idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    const costos = await sequelize.query(
      `
      SELECT 
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido = :idEstadoEntregado THEN (dp.subtotal - COALESCE(dp.descuento_aplicado_monto, 0))
          ELSE 0 
        END), 0) as costos_totales,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido != :idEstadoEntregado THEN (dp.subtotal - COALESCE(dp.descuento_aplicado_monto, 0))
          ELSE 0 
        END), 0) as costos_pendientes
      FROM detalle_pedido dp
      INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      WHERE p.id_usuario = :id_usuario
      `,
      {
        replacements: { id_usuario, idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    const ingresos_totales = Number(ingresos[0].ingresos_totales);
    const ventas_pendientes = Number(ingresos[0].ventas_pendientes);
    const costos_totales = Number(costos[0].costos_totales);
    const costos_pendientes = Number(costos[0].costos_pendientes);
    
    const ganancia = ingresos_totales - costos_totales;
    const ganancia_potencial = ventas_pendientes - costos_pendientes;

    res.json({
      ingresos: {
        completados: ingresos_totales,
        pendientes: ventas_pendientes,
        total: ingresos_totales + ventas_pendientes
      },
      costos: {
        completados: costos_totales,
        pendientes: costos_pendientes,
        total: costos_totales + costos_pendientes
      },
      ganancia: {
        actual: ganancia,
        potencial: ganancia_potencial,
        total: ganancia + ganancia_potencial
      }
    });
  } catch (error) {
    console.error("Error al obtener datos financieros:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

const getVentasPorMes = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    const estadoEntregado = await sequelize.query(
      "SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = 'Entregado' LIMIT 1",
      { type: QueryTypes.SELECT }
    );

    if (!estadoEntregado.length) {
      return res.status(500).json({ error: "Estado 'Entregado' no encontrado." });
    }

    const idEstadoEntregado = estadoEntregado[0].id_estado_pedido;

    const resultados = await sequelize.query(
      `
      WITH RECURSIVE meses AS (
        SELECT 1 as mes
        UNION ALL
        SELECT mes + 1 FROM meses WHERE mes < 12
      )
      SELECT 
        m.mes,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as totalVentas,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as ventasPendientes
      FROM meses m
      LEFT JOIN pedidos ped ON MONTH(ped.fecha_pedido) = m.mes
      LEFT JOIN detalle_pedido dp ON ped.id_pedido = dp.id_pedido
      LEFT JOIN producto p ON dp.id_producto = p.id_producto AND p.id_usuario = :id_usuario
      GROUP BY m.mes
      ORDER BY m.mes;
      `,
      {
        replacements: { id_usuario, idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    const ventasPorMes = resultados.map(r => ({
      mes: Number(r.mes),
      totalVentas: Number(r.totalVentas) || 0
    }));

    res.json(ventasPorMes);
  } catch (error) {
    console.error("Error al obtener ventas por mes:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

const getProductosMasVendidos = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    const estadoEntregado = await sequelize.query(
      "SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = 'Entregado' LIMIT 1",
      { type: QueryTypes.SELECT }
    );

    if (!estadoEntregado.length) {
      return res.status(500).json({ error: "Estado 'Entregado' no encontrado." });
    }

    const idEstadoEntregado = estadoEntregado[0].id_estado_pedido;

    const resultados = await sequelize.query(
      `
      SELECT
        p.id_producto,
        p.nombre_producto,
        COALESCE(SUM(inv.vendido), 0) AS vendidoInventario,
        COALESCE(SUM(CASE WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad ELSE 0 END), 0) AS vendidoDetalle,
        COALESCE(SUM(CASE WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad ELSE 0 END), 0) AS cantidadPendiente,
        CASE WHEN COALESCE(SUM(inv.vendido), 0) > 0 THEN COALESCE(SUM(inv.vendido), 0)
             ELSE COALESCE(SUM(CASE WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad ELSE 0 END), 0)
        END AS cantidadVendida
      FROM producto p
      LEFT JOIN inventario inv ON p.id_producto = inv.id_producto AND inv.id_agricultor = :id_usuario
      LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
      LEFT JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      WHERE p.id_usuario = :id_usuario
      GROUP BY p.id_producto, p.nombre_producto
      HAVING (COALESCE(SUM(inv.vendido),0) + COALESCE(SUM(CASE WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad ELSE 0 END),0) + COALESCE(SUM(CASE WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad ELSE 0 END),0)) > 0
      ORDER BY cantidadVendida DESC, cantidadPendiente DESC;
      `,
      {
        replacements: { id_usuario, idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener productos más vendidos:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

const getOrdenesEstado = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    const resultados = await sequelize.query(
      `
      SELECT 
        CASE 
          WHEN ep.nombre_estado = 'Entregado' THEN 'Completadas'
          ELSE 'Activas'
        END as estado,
        COUNT(DISTINCT ped.id_pedido) as total
      FROM pedidos ped
      INNER JOIN estado_pedido ep ON ped.id_estado_pedido = ep.id_estado_pedido
      INNER JOIN detalle_pedido dp ON ped.id_pedido = dp.id_pedido
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      WHERE p.id_usuario = :id_usuario
      GROUP BY CASE 
        WHEN ep.nombre_estado = 'Entregado' THEN 'Completadas'
        ELSE 'Activas'
      END;
      `,
      {
        replacements: { id_usuario },
        type: QueryTypes.SELECT,
      }
    );

    const ordenes = {
      activas: resultados.find(r => r.estado === 'Activas')?.total || 0,
      completadas: resultados.find(r => r.estado === 'Completadas')?.total || 0
    };

    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener estado de órdenes:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

const buildPdfReport = (title, rows, columns) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const drawHeader = () => {
          doc.fontSize(20).font('Helvetica-Bold').fillColor('#2E7D32').text('AGROSOFT', 40, 40, { align: 'left' });
          doc.fontSize(10).font('Helvetica').fillColor('#666').text('Sistema de Gestión Agrícola', 40, 65, { align: 'left' });
          
          doc.fontSize(9).font('Helvetica').fillColor('#555').text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 400, 40, { align: 'right', width: 155 });
          doc.text(`Hora: ${new Date().toLocaleTimeString('es-CO')}`, 400, 53, { align: 'right', width: 155 });

          doc.moveDown();
          doc.strokeColor('#4CAF50').lineWidth(2).moveTo(40, 85).lineTo(555, 85).stroke();
      };

      const drawFooter = (pageNumber) => {
          const bottom = doc.page.height - 40;
          doc.fontSize(8).fillColor('#999').text(`Generado por AgroSoft © 2025 | Página ${pageNumber}`, 40, bottom, { align: 'center', width: 515 });
      };

      let pageNumber = 1;
      drawHeader();
      
      doc.y = 100;
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(title.toUpperCase(), { align: 'center' });
      doc.moveDown(2);

      const startX = 40;
      const tableWidth = 515;
      const colWidth = tableWidth / columns.length; 
      const rowHeight = 25; 
      const fontSize = 9;

      const drawTableHeader = (y) => {
          doc.rect(startX, y, tableWidth, rowHeight).fill('#2E7D32');
          doc.fillColor('#fff').font('Helvetica-Bold').fontSize(fontSize);
          
          columns.forEach((col, i) => {
              doc.text(col.header, startX + (i * colWidth) + 5, y + 8, {
                  width: colWidth - 10,
                  align: 'left',
                  lineBreak: false,
                  ellipsis: true
              });
          });
      };

      let currentY = doc.y;
      drawTableHeader(currentY);
      currentY += rowHeight;

      doc.font('Helvetica').fontSize(fontSize).fillColor('#333');

      rows.forEach((row, rowIndex) => {
          if (currentY + rowHeight > doc.page.height - 50) {
              drawFooter(pageNumber);
              doc.addPage();
              pageNumber++;
              drawHeader();
              currentY = 100;
              drawTableHeader(currentY);
              currentY += rowHeight;
              doc.font('Helvetica').fontSize(fontSize).fillColor('#333');
          }

          if (rowIndex % 2 === 0) {
              doc.rect(startX, currentY, tableWidth, rowHeight).fill('#f9f9f9');
              doc.fillColor('#333');
          }

          columns.forEach((col, i) => {
             let value = row[col.key];
             if (value === null || value === undefined) value = '-';
             
             if (typeof value === 'number') {
                 if (col.key.includes('precio') || col.key.includes('total') || col.key.includes('valor')) {
                     value = '$ ' + value.toLocaleString('es-CO');
                 }
             }
             value = String(value);

              doc.text(value, startX + (i * colWidth) + 5, currentY + 8, {
                  width: colWidth - 10,
                  align: 'left',
                  lineBreak: false,
                  ellipsis: true
              });
          });

          currentY += rowHeight;
      });

      drawFooter(pageNumber);
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

const buildExcelReport = async (title, rows, columns) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reporte');
  
  sheet.mergeCells('A1:G1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = 'AGROSOFT - Sistema de Gestión Agrícola';
  headerCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
  headerCell.alignment = { horizontal: 'center', vertical: 'center' };
  sheet.getRow(1).height = 25;
  
  sheet.mergeCells('A2:G2');
  const titleCell = sheet.getCell('A2');
  titleCell.value = title;
  titleCell.font = { bold: true, size: 12 };
  titleCell.alignment = { horizontal: 'center', vertical: 'center' };
  sheet.getRow(2).height = 20;
  
  sheet.mergeCells('A3:G3');
  const metaCell = sheet.getCell('A3');
  metaCell.value = `Fecha: ${new Date().toLocaleDateString('es-CO')} | Hora: ${new Date().toLocaleTimeString('es-CO')}`;
  metaCell.font = { size: 10, color: { argb: 'FF666666' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'center' };
  
  sheet.addRow([]);
  
  const headerRow = sheet.addRow(columns.map(c => c.header));
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };
  
  rows.forEach(row => {
    const dataRow = sheet.addRow(columns.map(c => row[c.key]));
    dataRow.alignment = { horizontal: 'left', vertical: 'center' };
  });
  
  columns.forEach((col, idx) => {
    sheet.getColumn(idx + 1).width = col.key.includes('descripcion') ? 30 : 15;
  });
  
  const spacer = sheet.addRow([]);
  spacer.height = 15;
  sheet.mergeCells(`A${sheet.lastRow.number}:G${sheet.lastRow.number}`);
  const footerCell = sheet.getCell(`A${sheet.lastRow.number}`);
  footerCell.value = 'Generado por AGROSOFT © 2025 - Todos los derechos reservados';
  footerCell.font = { size: 9, color: { argb: 'FF666666' }, italic: true };
  footerCell.alignment = { horizontal: 'center', vertical: 'center' };
 
  return await workbook.xlsx.writeBuffer();
};

const buildHtmlTable = (title, columns, rows) => {
  let html = `<!doctype html><html><head><meta charset="utf-8"><title>AgroSoft - ${title}</title>`;
  html += `<style>
    body{font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:20px; background:#f9fafb; margin:0}
    .header{background:linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color:white; padding:20px; border-radius:8px 8px 0 0; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.1)}
    .header h1{margin:0; font-size:28px; font-weight:bold}
    .header p{margin:5px 0 0 0; font-size:12px; opacity:0.9}
    .container{background:white; border-radius:0 0 8px 8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden}
    .report-info{padding:15px 20px; border-bottom:1px solid #e0e0e0; font-size:12px; color:#666}
    .report-info span{margin-right:30px}
    .report-info strong{color:#333}
    table{border-collapse:collapse;width:100%; margin:20px}
    th,td{border:1px solid #ddd;padding:10px 12px;text-align:left; font-size:13px}
    th{background:#f5f5f5; font-weight:bold; color:#333}
    tr:nth-child(even){background:#fafafa}
    tr:hover{background:#f0f0f0}
  .footer{padding:15px 20px; border-top:1px solid #e0e0e0; font-size:11px; color:#999; text-align:right; margin-top:20px}
  </style>`;
  html += `</head><body>`;
  html += `<div class="header">
    <h1>AGROSOFT</h1>
    <p>Sistema de Gestión Agrícola</p>
  </div>
  <div class="container">
    <div class="report-info">
      <span><strong>Reporte:</strong> ${title}</span>
      <span><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</span>
      <span><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CO')}</span>
    </div>
    <table><thead><tr>`;
  columns.forEach(c => html += `<th>${c.header}</th>`);
  html += `</tr></thead><tbody>`;
  rows.forEach(r => {
    html += `<tr>`;
    columns.forEach(c => html += `<td>${r[c.key] !== undefined && r[c.key] !== null ? r[c.key] : '-'}</td>`);
    html += `</tr>`;
  });
  html += `</tbody></table>
    <div class="footer">
      Generado por AgroSoft © 2025 | Todos los derechos reservados
    </div>
  </div></body></html>`;
  return html;
};

const reportProductos = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) return res.status(401).json({ error: 'Usuario no autenticado.' });

    const sql = `
      SELECT p.id_producto, p.nombre_producto, p.descripcion_producto, p.precio_unitario, p.unidad_medida, p.estado_producto, COALESCE(inv.cantidad_disponible,0) as cantidad_disponible
      FROM producto p
      LEFT JOIN inventario inv ON p.id_producto = inv.id_producto AND inv.id_agricultor = :id_usuario
      WHERE p.id_usuario = :id_usuario
      ORDER BY p.nombre_producto;
    `;

    const productos = await sequelize.query(sql, { replacements: { id_usuario }, type: QueryTypes.SELECT });

    const columns = [
      { header: 'ID', key: 'id_producto' },
      { header: 'Nombre', key: 'nombre_producto' },
      { header: 'Descripción', key: 'descripcion_producto' },
      { header: 'Precio', key: 'precio_unitario' },
      { header: 'Unidad', key: 'unidad_medida' },
      { header: 'Estado', key: 'estado_producto' },
      { header: 'Cantidad disponible', key: 'cantidad_disponible' }
    ];

    if (req.query.format === 'html' || req.query.preview === '1') {
      const html = buildHtmlTable('Reporte de productos', columns, productos);
      return res.send(html);
    }

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_productos.pdf"');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);
      
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#4CAF50').text('AGROSOFT', { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#666').text('Sistema de Gestión Agrícola', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#4CAF50').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Reporte de Productos', { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} | Hora: ${new Date().toLocaleTimeString('es-CO')}`, { align: 'center' });
      doc.fillColor('black').moveDown();

      productos.forEach((p, idx) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${p.nombre_producto}`);
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text(`   ID: ${p.id_producto} | Precio: $${p.precio_unitario} | Unidad: ${p.unidad_medida || 'N/A'}`);
        if (p.descripcion_producto) {
          doc.fontSize(9).text(`   Descripción: ${p.descripcion_producto}`, { width: 470, height: 50 });
        }
        doc.fontSize(10).text(`   Estado: ${p.estado_producto} | Cantidad disponible: ${p.cantidad_disponible}`, { fillColor: '#2E7D32' });
        doc.fillColor('black').moveDown(0.5);
      });

      doc.moveDown(1.5);
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#999').text('Generado por AgroSoft © 2025 | Todos los derechos reservados', { align: 'center' });

      doc.end();
      return;
    }

    if (req.query.format === 'excel') {
      const buffer = await buildExcelReport('Reporte de Productos', productos, columns);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_productos.xlsx"');
      return res.send(buffer);
    }

    res.json(productos);
  } catch (error) {
    console.error('Error reportProductos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

const reportInventario = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) return res.status(401).json({ error: 'Usuario no autenticado.' });

    const sql = `
      SELECT p.id_producto, p.nombre_producto, COALESCE(inv.cantidad_disponible,0) as cantidad_disponible,
        COALESCE(SUM(dp.cantidad),0) as vendidos,
        NOW() as fecha_ultima_actualizacion, p.unidad_medida
      FROM producto p
      LEFT JOIN inventario inv ON p.id_producto = inv.id_producto AND inv.id_agricultor = :id_usuario
      LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
      WHERE p.id_usuario = :id_usuario
      GROUP BY p.id_producto, p.nombre_producto, inv.cantidad_disponible, p.unidad_medida
      ORDER BY p.nombre_producto;
    `;

    const rows = await sequelize.query(sql, { replacements: { id_usuario }, type: QueryTypes.SELECT });

    const columns = [
      { header: 'ID', key: 'id_producto' },
      { header: 'Producto', key: 'nombre_producto' },
      { header: 'Cantidad disponible', key: 'cantidad_disponible' },
      { header: 'Vendidos', key: 'vendidos' },
      { header: 'Última actualización', key: 'fecha_ultima_actualizacion' },
      { header: 'Unidad', key: 'unidad_medida' }
    ];

    if (req.query.format === 'html' || req.query.preview === '1') {
      return res.send(buildHtmlTable('Reporte de inventario', columns, rows));
    }

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_inventario.pdf"');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);
      
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#4CAF50').text('AGROSOFT', { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#666').text('Sistema de Gestión Agrícola', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#4CAF50').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Reporte de Inventario', { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} | Hora: ${new Date().toLocaleTimeString('es-CO')}`, { align: 'center' });
      doc.fillColor('black').moveDown();

      rows.forEach((r, idx) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${r.nombre_producto}`);
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text(`   Disponible: ${r.cantidad_disponible} ${r.unidad_medida || 'ud'} | Vendidos: ${r.vendidos} | Actualizado: ${r.fecha_ultima_actualizacion}`);
        doc.fillColor('black').moveDown(0.5);
      });

      doc.moveDown(1.5);
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#999').text('Generado por AgroSoft © 2025 | Todos los derechos reservados', { align: 'center' });

      doc.end();
      return;
    }

    if (req.query.format === 'excel') {
      const buffer = await buildExcelReport('Reporte de Inventario', rows, columns);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_inventario.xlsx"');
      return res.send(buffer);
    }

    res.json(rows);
  } catch (error) {
    console.error('Error reportInventario:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

const reportPedidos = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) return res.status(401).json({ error: 'Usuario no autenticado.' });

    const sql = `
      SELECT ped.id_pedido, u.nombre_usuario as cliente, ped.fecha_pedido, p.nombre_producto, dp.cantidad, dp.subtotal, ep.nombre_estado
      FROM detalle_pedido dp
      INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      INNER JOIN producto p ON dp.id_producto = p.id_producto
      LEFT JOIN usuarios u ON ped.id_usuario = u.id_usuario
      LEFT JOIN estado_pedido ep ON ped.id_estado_pedido = ep.id_estado_pedido
      WHERE p.id_usuario = :id_usuario
      ORDER BY ped.fecha_pedido DESC
    `;

    const rows = await sequelize.query(sql, { replacements: { id_usuario }, type: QueryTypes.SELECT });

    const columns = [
      { header: 'Pedido', key: 'id_pedido' },
      { header: 'Cliente', key: 'cliente' },
      { header: 'Fecha', key: 'fecha_pedido' },
      { header: 'Producto', key: 'nombre_producto' },
      { header: 'Cantidad', key: 'cantidad' },
      { header: 'Total línea', key: 'subtotal' },
      { header: 'Estado', key: 'nombre_estado' }
    ];

    if (req.query.format === 'html' || req.query.preview === '1') {
      return res.send(buildHtmlTable('Reporte de pedidos / ventas', columns, rows));
    }

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_pedidos.pdf"');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);
      
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#4CAF50').text('AGROSOFT', { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#666').text('Sistema de Gestión Agrícola', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#4CAF50').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Reporte de Pedidos / Ventas', { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} | Hora: ${new Date().toLocaleTimeString('es-CO')}`, { align: 'center' });
      doc.fillColor('black').moveDown();

      rows.forEach((r, idx) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. Pedido #${r.id_pedido} - ${r.cliente}`);
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text(`   Fecha: ${r.fecha_pedido} | Producto: ${r.nombre_producto}`);
        doc.text(`   Cantidad: ${r.cantidad} | Total: $${r.subtotal} | Estado: ${r.nombre_estado}`);
        doc.fillColor('black').moveDown(0.5);
      });

      doc.moveDown(1.5);
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#999').text('Generado por AgroSoft © 2025 | Todos los derechos reservados', { align: 'center' });

      doc.end();
      return;
    }

    if (req.query.format === 'excel') {
      const buffer = await buildExcelReport('Reporte de Pedidos / Ventas', rows, columns);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_pedidos.xlsx"');
      return res.send(buffer);
    }

    res.json(rows);
  } catch (error) {
    console.error('Error reportPedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

const reportDescuentos = async (req, res) => {
  try {
    const id_usuario = getUserId(req);
    if (!id_usuario) return res.status(401).json({ error: 'Usuario no autenticado.' });

    const sql = `
      SELECT d.id_descuento, d.valor_descuento, d.fecha_inicio, d.fecha_fin, d.estado, p.nombre_producto
      FROM descuentos d
      LEFT JOIN producto_descuento pd ON d.id_descuento = pd.id_descuento
      LEFT JOIN producto p ON pd.id_producto = p.id_producto
      WHERE p.id_usuario = :id_usuario OR p.id_usuario IS NULL
      ORDER BY d.fecha_inicio DESC
    `;

    const rows = await sequelize.query(sql, { replacements: { id_usuario }, type: QueryTypes.SELECT });

    const columns = [
      { header: 'ID Descuento', key: 'id_descuento' },
      { header: 'Valor', key: 'valor_descuento' },
      { header: 'Inicio', key: 'fecha_inicio' },
      { header: 'Fin', key: 'fecha_fin' },
      { header: 'Estado', key: 'estado' },
      { header: 'Producto', key: 'nombre_producto' }
    ];

    if (req.query.format === 'html' || req.query.preview === '1') return res.send(buildHtmlTable('Reporte de descuentos y ofertas', columns, rows));
    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_descuentos.pdf"');
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);
      
      doc.fontSize(20).font('Helvetica-Bold').text('AgroSoft', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Sistema de Gestión Agrícola', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#4CAF50').lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(14).font('Helvetica-Bold').text('Reporte de Descuentos y Ofertas', { align: 'center' });
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} | Hora: ${new Date().toLocaleTimeString('es-CO')}`, { align: 'center' });
      doc.fillColor('black').moveDown();

      rows.forEach((r, idx) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. Descuento #${r.id_descuento} - ${r.nombre_producto || 'General'}`);
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text(`   Valor: $${r.valor_descuento} | Estado: ${r.estado}`);
        doc.text(`   Período: ${r.fecha_inicio || 'N/A'} a ${r.fecha_fin || 'N/A'}`);
        doc.fillColor('black').moveDown(0.5);
      });

      doc.moveDown(1.5);
      doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#999').text('Generado por AgroSoft © 2025 | Todos los derechos reservados', { align: 'center' });

      doc.end();
      return;
    }

    if (req.query.format === 'excel') {
      const buffer = await buildExcelReport('Reporte de Descuentos y Ofertas', rows, columns);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_descuentos.xlsx"');
      return res.send(buffer);
    }

    res.json(rows);
  } catch (error) {
    console.error('Error reportDescuentos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

const getDatosFinancierosAdmin = async (req, res) => {
  try {
    const estadoEntregado = await sequelize.query(
      "SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = 'Entregado' LIMIT 1",
      { type: QueryTypes.SELECT }
    );

    if (!estadoEntregado.length) {
      return res.status(500).json({ error: "Estado 'Entregado' no encontrado." });
    }

    const idEstadoEntregado = estadoEntregado[0].id_estado_pedido;

    const ingresos = await sequelize.query(
      `
      SELECT 
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as ingresos_totales,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as ventas_pendientes
      FROM detalle_pedido dp
      INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      `,
      {
        replacements: { idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    const costos = await sequelize.query(
      `
      SELECT 
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido = :idEstadoEntregado THEN (dp.subtotal - COALESCE(dp.descuento_aplicado_monto, 0))
          ELSE 0 
        END), 0) as costos_totales,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido != :idEstadoEntregado THEN (dp.subtotal - COALESCE(dp.descuento_aplicado_monto, 0))
          ELSE 0 
        END), 0) as costos_pendientes
      FROM detalle_pedido dp
      INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      `,
      {
        replacements: { idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    const ingresos_totales = Number(ingresos[0].ingresos_totales);
    const ventas_pendientes = Number(ingresos[0].ventas_pendientes);
    const costos_totales = Number(costos[0].costos_totales);
    const costos_pendientes = Number(costos[0].costos_pendientes);
    
    const ganancia = ingresos_totales - costos_totales;
    const ganancia_potencial = ventas_pendientes - costos_pendientes;

    res.json({
      ingresos: {
        completados: ingresos_totales,
        pendientes: ventas_pendientes,
        total: ingresos_totales + ventas_pendientes
      },
      costos: {
        completados: costos_totales,
        pendientes: costos_pendientes,
        total: costos_totales + costos_pendientes
      },
      ganancia: {
        actual: ganancia,
        potencial: ganancia_potencial,
        total: ganancia + ganancia_potencial
      }
    });
  } catch (error) {
    console.error("Error al obtener datos financieros admin:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getVentasPorMesAdmin = async (req, res) => {
  try {
    const estadoEntregado = await sequelize.query(
      "SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = 'Entregado' LIMIT 1",
      { type: QueryTypes.SELECT }
    );

    if (!estadoEntregado.length) return res.status(500).json({ error: "Estado 'Entregado' no encontrado." });
    const idEstadoEntregado = estadoEntregado[0].id_estado_pedido;

    const resultados = await sequelize.query(
      `
      WITH RECURSIVE meses AS (
        SELECT 1 as mes
        UNION ALL
        SELECT mes + 1 FROM meses WHERE mes < 12
      )
      SELECT 
        m.mes,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as totalVentas,
        COALESCE(SUM(CASE 
          WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad * dp.precio_unitario_al_momento 
          ELSE 0 
        END), 0) as ventasPendientes
      FROM meses m
      LEFT JOIN pedidos ped ON MONTH(ped.fecha_pedido) = m.mes AND YEAR(ped.fecha_pedido) = YEAR(CURDATE())
      LEFT JOIN detalle_pedido dp ON ped.id_pedido = dp.id_pedido
      GROUP BY m.mes
      ORDER BY m.mes;
      `,
      {
        replacements: { idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );

    res.json(resultados.map(r => ({
      mes: Number(r.mes),
      totalVentas: Number(r.totalVentas) || 0,
      ventasPendientes: Number(r.ventasPendientes) || 0
    })));
  } catch (error) {
    console.error("Error al obtener ventas por mes admin:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getProductosMasVendidosAdmin = async (req, res) => {
  try {
    const estadoEntregado = await sequelize.query(
      "SELECT id_estado_pedido FROM estado_pedido WHERE nombre_estado = 'Entregado' LIMIT 1",
      { type: QueryTypes.SELECT }
    );

    if (!estadoEntregado.length) return res.status(500).json({ error: "Estado 'Entregado' no encontrado." });
    const idEstadoEntregado = estadoEntregado[0].id_estado_pedido;

    const resultados = await sequelize.query(
      `
      SELECT
        p.id_producto,
        p.nombre_producto,
        COALESCE(SUM(inv.vendido), 0) AS vendidoInventario,
        COALESCE(SUM(CASE WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad ELSE 0 END), 0) AS vendidoDetalle,
        COALESCE(SUM(CASE WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad ELSE 0 END), 0) AS cantidadPendiente,
        CASE WHEN COALESCE(SUM(inv.vendido), 0) > 0 THEN COALESCE(SUM(inv.vendido), 0)
             ELSE COALESCE(SUM(CASE WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad ELSE 0 END), 0)
        END AS cantidadVendida
      FROM producto p
      LEFT JOIN inventario inv ON p.id_producto = inv.id_producto
      LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
      LEFT JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      GROUP BY p.id_producto, p.nombre_producto
      HAVING (COALESCE(SUM(inv.vendido),0) + COALESCE(SUM(CASE WHEN ped.id_estado_pedido = :idEstadoEntregado THEN dp.cantidad ELSE 0 END),0) + COALESCE(SUM(CASE WHEN ped.id_estado_pedido != :idEstadoEntregado THEN dp.cantidad ELSE 0 END),0)) > 0
      ORDER BY cantidadVendida DESC, cantidadPendiente DESC
      LIMIT 10;
      `,
      {
        replacements: { idEstadoEntregado },
        type: QueryTypes.SELECT,
      }
    );
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener productos más vendidos admin:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getOrdenesEstadoAdmin = async (req, res) => {
  try {
    const resultados = await sequelize.query(
      `
      SELECT 
        CASE 
          WHEN ep.nombre_estado = 'Entregado' THEN 'Completadas'
          ELSE 'Activas'
        END as estado,
        COUNT(DISTINCT ped.id_pedido) as total
      FROM pedidos ped
      INNER JOIN estado_pedido ep ON ped.id_estado_pedido = ep.id_estado_pedido
      GROUP BY CASE 
        WHEN ep.nombre_estado = 'Entregado' THEN 'Completadas'
        ELSE 'Activas'
      END;
      `,
      { type: QueryTypes.SELECT }
    );

    const ordenes = {
      activas: resultados.find(r => r.estado === 'Activas')?.total || 0,
      completadas: resultados.find(r => r.estado === 'Completadas')?.total || 0
    };

    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener estado de órdenes admin:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const reportProductosAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT p.id_producto, p.nombre_producto, p.descripcion_producto, p.precio_unitario, p.unidad_medida, p.estado_producto, 
             COALESCE(inv.cantidad_disponible,0) as cantidad_disponible,
             u.nombre_usuario as productor
      FROM producto p
      LEFT JOIN inventario inv ON p.id_producto = inv.id_producto
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      ORDER BY p.nombre_producto;
    `;
    const productos = await sequelize.query(sql, { type: QueryTypes.SELECT });

    const columns = [
      { header: 'ID', key: 'id_producto' },
      { header: 'Nombre', key: 'nombre_producto' },
      { header: 'Productor', key: 'productor' },
      { header: 'Precio', key: 'precio_unitario' },
      { header: 'Unidad', key: 'unidad_medida' },
      { header: 'Estado', key: 'estado_producto' },
      { header: 'Stock', key: 'cantidad_disponible' }
    ];

    if (req.query.format === 'html' || req.query.preview === '1') {
      return res.send(buildHtmlTable('Reporte Global de Productos', columns, productos));
    }

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_productos_admin.pdf"');
      const buffer = await buildPdfReport('Reporte Global de Productos', productos, columns);
      res.send(buffer);
      return;
    }

    if (req.query.format === 'excel') {
      const buffer = await buildExcelReport('Reporte Global de Productos', productos, columns);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_productos_admin.xlsx"');
      return res.send(buffer);
    }

    res.json(productos);
  } catch (error) {
    console.error('Error reportProductosAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const reportInventarioAdmin = async (req, res) => {
  try {
     const sql = `
      SELECT p.id_producto, p.nombre_producto, COALESCE(inv.cantidad_disponible,0) as cantidad_disponible,
        COALESCE(SUM(dp.cantidad),0) as vendidos,
        (p.precio_unitario * COALESCE(inv.cantidad_disponible,0)) as valor_inventario,
        NOW() as fecha_ultima_actualizacion, p.unidad_medida,
        u.nombre_usuario as productor
      FROM producto p
      LEFT JOIN inventario inv ON p.id_producto = inv.id_producto
      LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
      GROUP BY p.id_producto, p.nombre_producto, inv.cantidad_disponible, p.precio_unitario, p.unidad_medida, u.nombre_usuario
      ORDER BY p.nombre_producto;
    `;
    const rows = await sequelize.query(sql, { type: QueryTypes.SELECT });
    
    const columns = [
        { header: 'ID', key: 'id_producto' },
        { header: 'Producto', key: 'nombre_producto' },
        { header: 'Productor', key: 'productor' },
        { header: 'Stock', key: 'cantidad_disponible' },
        { header: 'Vendidos', key: 'vendidos' },
        { header: 'Valor Inventario', key: 'valor_inventario' },
        { header: 'Unidad', key: 'unidad_medida' }
    ];

    if (req.query.format === 'html' || req.query.preview === '1') {
        return res.send(buildHtmlTable('Reporte Global de Inventario', columns, rows));
    }

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_inventario_admin.pdf"');
      const buffer = await buildPdfReport('Reporte Global de Inventario', rows, columns);
      res.send(buffer);
      return;
    }

    if (req.query.format === 'excel') {
      const buffer = await buildExcelReport('Reporte Global de Inventario', rows, columns);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_inventario_admin.xlsx"');
      return res.send(buffer);
    }

    res.json(rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({error: 'Error server'});
  }
};

const reportPedidosAdmin = async (req, res) => {
    try {
        const sql = `
          SELECT ped.id_pedido, u.nombre_usuario as cliente, ped.fecha_pedido, p.nombre_producto, dp.cantidad, dp.subtotal, ep.nombre_estado,
                 prod.nombre_usuario as productor
          FROM detalle_pedido dp
          INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
          INNER JOIN producto p ON dp.id_producto = p.id_producto
          LEFT JOIN usuarios prod ON p.id_usuario = prod.id_usuario
          LEFT JOIN usuarios u ON ped.id_usuario = u.id_usuario
          LEFT JOIN estado_pedido ep ON ped.id_estado_pedido = ep.id_estado_pedido
          ORDER BY ped.fecha_pedido DESC
        `;
        const rows = await sequelize.query(sql, { type: QueryTypes.SELECT });
        const columns = [
            { header: 'Pedido', key: 'id_pedido' },
            { header: 'Cliente', key: 'cliente' },
            { header: 'Productor', key: 'productor' },
            { header: 'Fecha', key: 'fecha_pedido' },
            { header: 'Producto', key: 'nombre_producto' },
            { header: 'Cantidad', key: 'cantidad' },
            { header: 'Total', key: 'subtotal' },
            { header: 'Estado', key: 'nombre_estado' }
        ];

        if (req.query.format === 'html' || req.query.preview === '1') {
            return res.send(buildHtmlTable('Reporte Global de Pedidos', columns, rows));
        }

        if (req.query.format === 'pdf') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename="reporte_pedidos_admin.pdf"');
          const buffer = await buildPdfReport('Reporte Global de Pedidos', rows, columns);
          res.send(buffer);
          return;
        }

        if (req.query.format === 'excel') {
          const buffer = await buildExcelReport('Reporte Global de Pedidos', rows, columns);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename="reporte_pedidos_admin.xlsx"');
          return res.send(buffer);
        }

        res.json(rows);
    } catch(e) {
        console.error(e);
        res.status(500).json({error: 'Error'});
    }
};

const reportDescuentosAdmin = async (req, res) => {
    try {
        const sql = `
          SELECT d.id_descuento, d.valor_descuento, d.fecha_inicio, d.fecha_fin, d.estado, p.nombre_producto, u.nombre_usuario as productor
          FROM descuentos d
          LEFT JOIN producto_descuento pd ON d.id_descuento = pd.id_descuento
          LEFT JOIN producto p ON pd.id_producto = p.id_producto
          LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
          ORDER BY d.fecha_inicio DESC
        `;
        const rows = await sequelize.query(sql, { type: QueryTypes.SELECT });
        const columns = [
            { header: 'ID', key: 'id_descuento' },
            { header: 'Valor', key: 'valor_descuento' },
            { header: 'Producto', key: 'nombre_producto' },
            { header: 'Productor', key: 'productor' },
            { header: 'Inicio', key: 'fecha_inicio' },
            { header: 'Fin', key: 'fecha_fin' },
            { header: 'Estado', key: 'estado' }
        ];
        if (req.query.format === 'html' || req.query.preview === '1') {
            return res.send(buildHtmlTable('Reporte Global de Descuentos', columns, rows));
        }

        if (req.query.format === 'pdf') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename="reporte_descuentos_admin.pdf"');
          const buffer = await buildPdfReport('Reporte Global de Descuentos', rows, columns);
          res.send(buffer);
          return;
        }

        if (req.query.format === 'excel') {
          const buffer = await buildExcelReport('Reporte Global de Descuentos', rows, columns);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename="reporte_descuentos_admin.xlsx"');
          return res.send(buffer);
        }

        res.json(rows);
    } catch(e) {
        console.error(e);
        res.status(500).json({error: 'Error'});
    }
};

module.exports = {
  getDatosFinancieros,
  getVentasPorMes,
  getProductosMasVendidos,
  getOrdenesEstado,
  reportProductos,
  reportInventario,
  reportPedidos,
  reportDescuentos,
  // Admin exports
  getDatosFinancierosAdmin,
  getVentasPorMesAdmin,
  getProductosMasVendidosAdmin,
  getOrdenesEstadoAdmin,
  reportProductosAdmin,
  reportInventarioAdmin,
  reportPedidosAdmin,
  reportDescuentosAdmin
};
