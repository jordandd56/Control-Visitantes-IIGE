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

exports.crearArea = async (req, res) => {
  try {
    const { nombre } = req.body;

    const areaExistente = await Area.findOne({ where: { nombre } });
    if (areaExistente) {
      return res.status(400).json({
        message: "Ya existe un área con ese nombre",
      });
    }

    // Si no existe, crea el área
    const nuevaArea = await Area.create({ nombre });
    res.status(201).json(nuevaArea);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear área", error: error.message });
  }
};
