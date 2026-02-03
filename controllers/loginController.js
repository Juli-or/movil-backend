const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_agrosoft";

exports.login = async (req, res) => {
  try {
    const { correo_electronico, password } = req.body;

    if (!correo_electronico || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios", status: "error" });
    }

    const user = await User.findOne({ where: { correo_electronico } });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas (Correo no encontrado)", status: "error" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas (Contraseña incorrecta)", status: "error" });
    }

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        correo_electronico: user.correo_electronico,
        id_rol: user.id_rol,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      status: "success",
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        correo_electronico: user.correo_electronico,
        id_rol: user.id_rol,
      },
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error interno del servidor", status: "error" });
  }
};
