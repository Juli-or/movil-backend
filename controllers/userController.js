const registerController = require("./registerController");
const loginController = require("./loginController");
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

async function listUsers(req, res) {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      if (!isNaN(search) && search.trim() !== '') {
        whereClause = {
          [Op.or]: [
            { id_usuario: search },
            { documento_identidad: { [Op.like]: `%${search}%` } }
          ]
        };
      } else {
        whereClause = {
          [Op.or]: [
            { nombre_usuario: { [Op.like]: `%${search}%` } },
            { correo_electronico: { [Op.like]: `%${search}%` } },
            { documento_identidad: { [Op.like]: `%${search}%` } },
            { estado: { [Op.like]: `%${search}%` } }
          ]
        };
      }
    }

    const users = await User.findAll({
      where: whereClause
    });
    return res.json(users);
  } catch (err) {
    console.error("Error al listar usuarios:", err);
    return res.status(500).json({ message: "Error al listar usuarios" });
  }
}

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
