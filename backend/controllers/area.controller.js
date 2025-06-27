const Area = require("../models/area.model.js");

exports.obtenerAreas = async (req, res) => {
  try {
    const areas = await Area.findAll();
    res.json(areas);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener áreas", error: error.message });
  }
};
