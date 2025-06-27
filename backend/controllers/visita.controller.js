const Visita = require("../models/visita.model");
const { Op } = require("sequelize");

exports.crearVisita = async (req, res) => {
  try {
    const {
      visitante_id,
      a_quien_visita,
      area_id,
      motivo,
      hora_ingreso,
      hora_salida,
      registrado_por,
      observacion,
    } = req.body;

    const nuevaVisita = await Visita.create({
      visitante_id,
      a_quien_visita,
      area_id,
      motivo,
      hora_ingreso,
      hora_salida,
      registrado_por,
      observacion,
      fecha: new Date(),
    });

    res.status(201).json(nuevaVisita);
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar la visita",
      error: error.message,
    });
  }
};
