const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model"); 

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_agrosoft'; 

exports.register = async (req, res) => {
    try {
        const { nombre_usuario, correo_electronico, password, documento_identidad, id_rol } = req.body;

        if (!nombre_usuario || !correo_electronico || !password || !documento_identidad || !id_rol) {
             return res.status(400).json({ message: "Todos los campos son obligatorios", status: "error" });
        }

        const existingUser = await User.findOne({ where: { correo_electronico } });
        
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado", status: "error" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            nombre_usuario,
            correo_electronico,
            password_hash: hashedPassword, 
            documento_identidad,
            id_rol: id_rol,
            estado: "Activo" 
        });

        const token = jwt.sign({ id_usuario: user.id_usuario, id_rol: user.id_rol }, JWT_SECRET, { expiresIn: '2h' });

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            status: "success",
            token,
            userId: user.id_usuario,
            user: {
                id_usuario: user.id_usuario,
                nombre_usuario: user.nombre_usuario,
                correo_electronico: user.correo_electronico,
                id_rol: user.id_rol
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            message: "Error en el servidor al registrar. Verifique la conexión o el esquema.", 
            status: "error",
            details: error.message 
        });
    }
};
