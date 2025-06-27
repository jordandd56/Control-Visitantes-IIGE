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

exports.obtenerVisitasDelDia = async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);

    const visitas = await Visita.findAll({
      where: {
        fecha: hoy,
      },
    });

    res.status(200).json(visitas);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las visitas del día",
      error: error.message,
    });
  }
};
