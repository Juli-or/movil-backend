// middlewares/adminMiddleware.js

// Asumiremos que el ID_ROL para 'Administrador' es 1. 
// Debes confirmar esto con los datos iniciales de tu tabla 'rol'.
const ROL_ADMIN_ID = 1; 

const adminMiddleware = (req, res, next) => {
    // 1. Verificar si el usuario está autenticado y tiene datos de usuario
    if (!req.user || !req.user.id_rol) {
        // Esto indica que el authMiddleware no se ejecutó o falló
        return res.status(401).json({ 
            message: 'Acceso denegado. Se requiere autenticación.' 
        });
    }

    // 2. Verificar si el rol del usuario es el de Administrador
    if (req.user.id_rol === ROL_ADMIN_ID) {
        // El usuario es Administrador, permitir el acceso
        next();
    } else {
        // El usuario no tiene permisos de Administrador
        return res.status(403).json({ 
            message: 'Acceso denegado. Se requiere rol de Administrador.' 
        });
    }
};

module.exports = adminMiddleware;