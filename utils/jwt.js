// backend/utils/jwt.js
const jwt = require("jsonwebtoken");

function generarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      rol: usuario.rol || "cliente",
    },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
}

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Acceso denegado. Token faltante." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ mensaje: "Token inválido o expirado." });
    }

    // 🔹 Guarda la info del usuario en ambas propiedades
    req.user = decoded;     // 👉 usada por tus controladores
    req.usuario = decoded;  // 👉 compatible con otros módulos antiguos

    console.log("🟢 Token decodificado:", decoded);
    next();
  });
}

module.exports = { generarToken, verificarToken };
