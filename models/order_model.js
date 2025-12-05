const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Pedido = db.define("pedidos", {
    id_pedido: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    id_usuario: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    fecha_pedido: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_pedido: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    id_metodo_pago: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    direccion_envio: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    ciudad_envio: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    codigo_postal_envio: {
        type: DataTypes.STRING(20)
    },
    id_estado_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_entrega_estimada: {
        type: DataTypes.DATE
    },
    fecha_entrega_real: {
        type: DataTypes.DATE
    },
    numero_seguimiento: {
        type: DataTypes.STRING(100),
        unique: true
    },
    notas_pedido: {
        type: DataTypes.TEXT
    }
}, {
    tableName: "pedidos",
    timestamps: false
});

module.exports = Pedido;