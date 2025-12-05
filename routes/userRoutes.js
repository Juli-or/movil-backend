const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); 
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const User = require("../models/user_model");

router.post("/register", userController.register);
router.post("/login", userController.login);

// Perfil del usuario autenticado
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const id = req.user?.id_usuario || req.user?.id;
    if (!id) return res.status(400).json({ success: false, error: "ID de usuario no disponible en token" });

    const user = await User.findOne({ where: { id_usuario: id } });
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    const profile = {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      nombre: user.nombre_usuario,
      email: user.correo_electronico,
      documento_identidad: user.documento_identidad,
      estado: user.estado,
    };

    return res.json({ success: true, user: profile });
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return res.status(500).json({ success: false, error: "Error interno al obtener perfil" });
  }
});

// Rutas de administración de usuarios
router.get("/", authenticateToken, isAdmin, userController.listUsers);
router.post("/", authenticateToken, isAdmin, userController.createUser);
router.put("/:id", authenticateToken, isAdmin, userController.updateUser);
router.delete("/:id", authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;
