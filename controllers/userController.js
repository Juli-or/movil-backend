const registerController = require("./registerController");
const loginController = require("./loginController");
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");

// Listar todos los usuarios
async function listUsers(req, res) {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (err) {
    console.error("Error al listar usuarios:", err);
    return res.status(500).json({ message: "Error al listar usuarios" });
  }
}

// Crear usuario
async function createUser(req, res) {
  try {
    const { nombre_usuario, correo_electronico, password_hash, id_rol, documento_identidad, estado } = req.body;

    if (!nombre_usuario || !correo_electronico || !password_hash || !id_rol) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const hashed = await bcrypt.hash(password_hash, 10);

    const newUser = await User.create({
      nombre_usuario,
      correo_electronico,
      password_hash: hashed,
      id_rol,
      documento_identidad,
      estado: estado || "Activo",
    });

    return res.status(201).json(newUser);
  } catch (err) {
    console.error("Error al crear usuario:", err);
    return res.status(500).json({ message: "Error al crear usuario" });
  }
}

// Actualizar usuario
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nombre_usuario, correo_electronico, password_hash, id_rol, documento_identidad, estado } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const updateData = {
      nombre_usuario,
      correo_electronico,
      id_rol,
      documento_identidad,
      estado,
    };

    if (password_hash) {
      updateData.password_hash = await bcrypt.hash(password_hash, 10);
    }

    await user.update(updateData);

    return res.json(user);
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
}

// Eliminar usuario
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    await user.destroy();
    return res.status(204).send();
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
}

module.exports = {
  register: registerController.register,
  login: loginController.login,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
