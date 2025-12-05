const { verifyToken } = require("../config/auth");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token requerido. Por favor inicia sesión.",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Token inválido o expirado.",
    });
  }
};

const isCliente = (req, res, next) => {
  if (req.user && req.user.id_rol === 1) return next();
  return res.status(403).json({ success: false, error: "Se requiere rol CLIENTE." });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.id_rol === 2) return next();
  return res.status(403).json({ success: false, error: "Se requiere rol ADMINISTRADOR." });
};

const isAgricultor = (req, res, next) => {
  if (req.user && req.user.id_rol === 3) return next();
  return res.status(403).json({ success: false, error: "Se requiere rol AGRICULTOR." });
};

const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.id_rol)) return next();
    return res.status(403).json({
      success: false,
      error: `Acceso denegado. Roles permitidos: ${roles.join(", ")}`,
    });
  };
};

module.exports = { authenticateToken, isCliente, isAdmin, isAgricultor, hasRole };
