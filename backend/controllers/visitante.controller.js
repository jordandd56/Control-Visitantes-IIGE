const { Visitante } = require("../models");
const { Op } = require("sequelize");

exports.agregarVisitante = async (req, res) => {
  try {
    const { cedula, pasaporte, nombres } = req.body;

    if ((!cedula && !pasaporte) || !nombres) {
      return res.status(400).json({
        error:
          "Se requiere al menos cedula o pasaporte, y el campo nombres es obligatorio",
      });
    }

    if (cedula) {
      const existente = await Visitante.findOne({ where: { cedula } });
      if (existente) {
        return res
          .status(409)
          .json({ error: "Ya existe un visitante con esa cédula" });
      }
    }

    const nuevoVisitante = await Visitante.create({
      cedula,
      pasaporte,
      nombres,
    });

    res.status(201).json({
      message: "Visitante agregado correctamente",
      visitante: nuevoVisitante,
    });
  } catch (error) {
    console.error("Error al agregar visitante:", error);
    res.status(500).json({ error: "Error interno al agregar visitante" });
  }
};

exports.buscarVisitante = async (req, res) => {
  try {
    const { cedula, pasaporte } = req.query;

    if (!cedula && !pasaporte) {
      return res.status(400).json({
        error: "Se requiere al menos cédula o pasaporte para buscar",
      });
    }

    const visitante = await Visitante.findOne({
      where: {
        [Op.or]: [
          cedula ? { cedula } : null,
          pasaporte ? { pasaporte } : null,
        ].filter(Boolean),
      },
    });

    if (!visitante) {
      return res.status(404).json({ error: "Visitante no encontrado" });
    }

    res.json(visitante);
  } catch (error) {
    console.error("Error al buscar visitante:", error);
    res.status(500).json({ error: "Error interno al buscar visitante" });
  }
};
