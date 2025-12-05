const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./models/associations_model");

const db = require("./config/db");

// Rutas de Cliente
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products_routes");
const reviewRoutes = require("./routes/review_routes");
const pqrsRoutes = require("./routes/pqrs_routes");
const ofertasRoutes = require("./routes/ofertas_routes");
const descuentosRoutes = require("./routes/descuentos_routes");
const ofertaRoutes = require("./routes/ofertaRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const productorRoutes = require("./routes/productorRoutes");
const finanzasRoutes = require("./routes/finanzasRoutes");
const comentarioResenaRoutes = require("./routes/comentarioResenaRoutes");
const subcategoriaRoutes = require('./routes/subcategoriaRoutes');
const carritoRoutes = require("./routes/carrito_routes");
const pedidoRoutes = require("./routes/pedido_routes");

// Rutas de Administrador
const rolRoutes = require('./routes/rolRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const descuentoRoutes = require('./routes/descuentoRoutes');
const productoDescuentoRoutes = require('./routes/productoDescuentoRoutes');
const estadoPqrsRoutes = require('./routes/estadoPqrsRoutes');
const tipoPqrsRoutes = require('./routes/tipoPqrsRoutes');
const estadoPedidoRoutes = require('./routes/estadoPedidoRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rutas Públicas
app.get("/", (req, res) => {
  res.send("Servidor funcionando...");
});

// Rutas de Usuarios
app.use("/api/users", userRoutes);

// Rutas de Productos
app.use("/api/products", productRoutes);

// Rutas de Reviews
app.use("/api/reviews", reviewRoutes);

// Rutas de PQRS
app.use("/api/pqrs", pqrsRoutes);
app.use('/api/tipoPqrs', tipoPqrsRoutes);
app.use('/api/estadoPqrs', estadoPqrsRoutes);

// Rutas de Ofertas y Descuentos
app.use("/api/ofertas", ofertasRoutes);
app.use("/api/ofertas-alt", ofertaRoutes);
app.use("/api/descuentos", descuentosRoutes);
app.use('/api/descuentos-alt', descuentoRoutes);
app.use('/api/product-discounts', productoDescuentoRoutes);

// Rutas de Órdenes y Pedidos
app.use("/api/ordenes", ordenRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use('/api/estadoPedido', estadoPedidoRoutes);

// Rutas de Productor, Finanzas e Inventario
app.use("/api/productor", productorRoutes);
app.use("/api/finanzas", finanzasRoutes);
const inventarioRoutes = require("./routes/inventarioRoutes");
app.use("/api/inventarios", inventarioRoutes);

// Rutas de Comentarios y Reseñas
app.use("/api/comentarios", comentarioResenaRoutes);

// Rutas de Categorías y Subcategorías
app.use("/api/categories", categoriaRoutes);
app.use('/api/subcategorias', subcategoriaRoutes);

// Rutas de Carrito
app.use("/api/carrito", carritoRoutes);

// Rutas de Administración
app.use('/api/roles', rolRoutes);


db.authenticate()
  .then(() => {
    console.log(" Conectado a la base de datos MySQL");
  })
  .catch((err) => {
    console.error(" Error al conectar DB:", err);
  });



app.use((err, req, res, next) => {
  console.error(" Error no manejado:", err.stack);
  res.status(500).json({
    success: false,
    error: "Error interno en el servidor"
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
});