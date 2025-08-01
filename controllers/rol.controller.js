const Rol = require("../models/rol.model"); // ✅ correcto
const { Op } = require("sequelize");

exports.obtenerRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener roles", error: error.message });
  }
};
