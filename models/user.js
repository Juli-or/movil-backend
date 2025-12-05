const db = require("../config/db"); 

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query("SELECT * FROM usuarios u WHERE u.correo_electronico = ?", [email]);
        return rows;
    },

    create: async (nombre_usuario, hashedPassword, correo_electronico, documento_identidad, id_rol) => {
        const [result] = await db.query(
            "INSERT INTO usuarios (nombre_usuario, password_hash, correo_electronico, documento_identidad, id_rol) VALUES (?, ?, ?, ?, ?)",
            [nombre_usuario, hashedPassword, correo_electronico, documento_identidad, id_rol]
        );
        return result;
    }
};

module.exports = User;

