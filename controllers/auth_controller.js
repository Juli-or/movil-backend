const User = require("../models/user_model"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_agrosoft';

exports.register = async (req, res) => {
    try {
        const { nombre_usuario, correo_electronico, password, documento_identidad, id_rol = 1 } = req.body;

        if (!nombre_usuario || !correo_electronico || !password || !documento_identidad) {
             return res.status(400).json({ message: "Faltan campos obligatorios", status: "error" });
        }
        
        const userExists = await User.findByEmail(correo_electronico);
        if (userExists.length > 0) {
            return res.status(400).json({ message: "El correo ya está registrado", status: "error" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.create(nombre_usuario, hashedPassword, correo_electronico, documento_identidad, id_rol);

        const token = jwt.sign({ id_usuario: result.insertId, id_rol: id_rol }, JWT_SECRET, { expiresIn: '2h' });

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            status: "success",
            token,
            userId: result.insertId,
            user: { 
                id_usuario: result.insertId,
                nombre_usuario: nombre_usuario,
                correo_electronico: correo_electronico,
                id_rol: id_rol
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: "Error interno del servidor", status: "error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo_electronico, password } = req.body;

        if (!correo_electronico || !password) {
            return res.status(400).json({ 
                message: 'Correo electrónico y contraseña son requeridos.', 
                status: 'error' 
            });
        }

        const userRows = await User.findByEmail(correo_electronico);
        const user = userRows[0];
        if (!user) {
            return res.status(401).json({ 
                message: 'Credenciales inválidas.', 
                status: 'error' 
            });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ 
                message: 'Credenciales inválidas.', 
                status: 'error' 
            });
        }

        const token = jwt.sign({ 
            id_usuario: user.id_usuario, 
            id_rol: user.id_rol 
        }, JWT_SECRET, { expiresIn: '2h' });

        res.json({ 
            message: 'Inicio de sesión exitoso',
            status: 'success',
            token, 
            user: {
                id_usuario: user.id_usuario,
                nombre_usuario: user.nombre_usuario,
                correo_electronico: user.correo_electronico,
                id_rol: user.id_rol
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ 
            message: 'Error interno del servidor.', 
            status: 'error' 
        });
    }
};