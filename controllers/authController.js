const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Rol = require('../models/rol');

// configurar variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

exports.register = async (req, res) => {
  const { nombre, email, contrasena, telefono, id_rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const user = await User.create({
      nombre,
      email,
      contrasena: hashedPassword,
      telefono,
      id_rol
    });
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const user = await User.findOne({ where: { email }, include: [Rol] });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }
    const token = jwt.sign(
      { id_usuario: user.id_usuario, rol: user.Rol.nombre_rol },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};