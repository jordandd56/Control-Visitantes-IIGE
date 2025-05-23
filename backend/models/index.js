const sequelize = require("../config/db");
const Area = require("./area.model");
const Rol = require("./rol.model");
const Usuario = require("./usuario.model");
const Visitante = require("./visitante.model");
const Visita = require("./visita.model");

// Relaciones
Rol.hasMany(Usuario, { foreignKey: "rol_id" });
Usuario.belongsTo(Rol, { foreignKey: "rol_id" });

Area.hasMany(Visita, { foreignKey: "area_id" });
Visita.belongsTo(Area, { foreignKey: "area_id" });

Usuario.hasMany(Visita, { foreignKey: "registrado_por" });
Visita.belongsTo(Usuario, { foreignKey: "registrado_por" });

Visitante.hasMany(Visita, { foreignKey: "visitante_id" });
Visita.belongsTo(Visitante, { foreignKey: "visitante_id" });

module.exports = {
  sequelize,
  Area,
  Rol,
  Usuario,
  Visitante,
  Visita,
};
