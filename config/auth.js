const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_agrosoft";

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
