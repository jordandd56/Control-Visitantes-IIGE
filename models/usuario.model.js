const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_completo: { type: DataTypes.STRING(100), allowNull: false },
    usuario: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    contrasena: { type: DataTypes.STRING(255), allowNull: false },
    rol_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

/* ------- Hooks automáticos -------- */
const SALT_ROUNDS = 10;

Usuario.addHook("beforeCreate", async (user) => {
  user.contrasena = await bcrypt.hash(user.contrasena, SALT_ROUNDS);
});

Usuario.addHook("beforeUpdate", async (user) => {
  if (user.changed("contrasena")) {
    user.contrasena = await bcrypt.hash(user.contrasena, SALT_ROUNDS);
  }
});

/* ------- Método de instancia -------- */
Usuario.prototype.validarContrasena = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.contrasena);
};

module.exports = Usuario;
