const { Visita, Visitante, Area, Usuario } = require("../models");
const { Op } = require("sequelize");

const includeFullInfo = [
  {
    model: Visitante,
    attributes: ["nombres", "empresa", "contacto", "cedula"],
  },
  {
    model: Area,
    attributes: ["nombre"],
  },
  {
    model: Usuario,
    attributes: ["nombre_completo"],
  },
];

exports.crearVisita = async (req, res) => {
  try {
    const {
      visitante_id,
      a_quien_visita,
      area_id,
      motivo,
      fecha,
      registrado_por,
      estado,
    } = req.body;

    const visitanteIdNum = Number(visitante_id);
    const areaIdNum = Number(area_id);
    const registradoPorNum = Number(registrado_por);

    // Convertir fecha a formato ISO YYYY-MM-DD si es necesario
    let fechaISO = fecha;
    if (typeof fecha === "string" && fecha.includes("-")) {
      const partes = fecha.split("-");
      if (partes[0].length === 2) {
        fechaISO = `${partes[2]}-${partes[1].padStart(
          2,
          "0"
        )}-${partes[0].padStart(2, "0")}`;
      }
    }

    const nuevaVisita = await Visita.create({
      visitante_id: visitanteIdNum,
      a_quien_visita,
      area_id: areaIdNum,
      motivo,
      fecha: fechaISO,
      registrado_por: registradoPorNum,
      estado: estado || "null",
    });

    await nuevaVisita.reload({ include: includeFullInfo });
    res.status(201).json(nuevaVisita);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear visita", error: error.message });
  }
};

exports.actualizarEstadoVisita = async (req, res) => {
  const { id } = req.params;
  const { estado, observacion } = req.body;

  try {
    const visita = await Visita.findByPk(id);
    if (!visita) {
      return res.status(404).json({ message: "Visita no encontrada" });
    }

    if (!["ingreso", "salida"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    visita.estado = estado;

    if (estado === "salida" && observacion !== undefined) {
      visita.observacion = observacion;
    }

    await visita.save();
    await visita.reload({ include: includeFullInfo });

    res.json({ message: "Estado y observación actualizados", visita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

exports.obtenerVisitasActivas = async (_req, res) => {
  const activas = await Visita.findAll({
    where: { estado: "ingreso", hora_salida: { [Op.is]: null } },
    include: includeFullInfo,
  });
  res.json(activas);
};

exports.obtenerVisitasDelDia = async (_req, res) => {
  try {
    const ahora = new Date();

    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, "0");
    const dd = String(ahora.getDate()).padStart(2, "0");

    const fechaHoy = `${yyyy}-${mm}-${dd}`; // ejemplo: "2025-07-16"

    const visitas = await Visita.findAll({
      where: { fecha: fechaHoy },
      include: includeFullInfo,
    });

    res.json(visitas);
  } catch (error) {
    console.error("Error al obtener visitas del día:", error);
    res.status(500).json({ error: "Error al obtener visitas del día" });
  }
};

exports.obtenerReportePorCedula = async (req, res) => {
  const { cedula } = req.query;

  if (!cedula) {
    return res.status(400).json({ message: "Se requiere la cédula" });
  }

  try {
    const visitante = await Visitante.findOne({
      where: { cedula },
    });

    if (!visitante) {
      return res.status(404).json({ message: "Visitante no encontrado" });
    }

    const visitas = await Visita.findAll({
      where: { visitante_id: visitante.id },
      include: includeFullInfo,
      order: [
        ["fecha", "DESC"],
        ["hora_ingreso", "DESC"],
      ],
    });

    if (visitas.length === 0) {
      return res.json({
        titulo: "Registro de visitas",
        visitante: {
          nombres: visitante.nombres,
          empresa: visitante.empresa,
          contacto: visitante.contacto,
          cedula: visitante.cedula,
        },
        totalVisitas: 0,
        descripcion: `El señor/a ${visitante.nombres} no ha realizado ninguna visita registrada.`,
        visitas: [],
      });
    }

    const conteoAreas = {};
    visitas.forEach((v) => {
      const area = v.Area?.nombre || "Desconocida";
      conteoAreas[area] = (conteoAreas[area] || 0) + 1;
    });

    const areasFrecuentes = Object.entries(conteoAreas)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, cantidad]) => `${cantidad} visita(s) al área ${nombre}`)
      .join(", ");

    const ultimaVisita = visitas[0];

    const descripcion = `El señor/a ${
      visitante.nombres
    } ha ingresado un total de ${visitas.length} veces al establecimiento. 
Sus áreas más visitadas son: ${areasFrecuentes}.
La última visita fue el ${ultimaVisita.fecha} con motivo: "${
      ultimaVisita.motivo || "no especificado"
    }", registrada por ${
      ultimaVisita.Usuario?.nombre_completo || "usuario desconocido"
    }.`;

    const reporte = {
      titulo: "Registro de visitas",
      visitante: {
        nombres: visitante.nombres,
        empresa: visitante.empresa,
        contacto: visitante.contacto,
        cedula: visitante.cedula,
      },
      totalVisitas: visitas.length,
      descripcion,
      visitas: visitas.map((v) => ({
        fecha: v.fecha,
        hora_ingreso: v.hora_ingreso,
        hora_salida: v.hora_salida,
        estado: v.estado,
        a_quien_visita: v.a_quien_visita,
        area: v.Area?.nombre,
        motivo: v.motivo,
        observacion: v.observacion,
        registrado_por: v.Usuario?.nombre_completo,
      })),
    };

    res.json(reporte);
  } catch (error) {
    console.error("Error al obtener el reporte:", error);
    res.status(500).json({ message: "Error interno al generar el reporte" });
  }
};

exports.reportePorFecha = async (req, res) => {
  const { fecha } = req.query;

  if (!fecha) {
    return res
      .status(400)
      .json({ message: "Se requiere una fecha (YYYY-MM-DD)" });
  }

  try {
    const visitas = await Visita.findAll({
      where: { fecha },
      include: [
        {
          model: Visitante,
          attributes: ["nombres", "cedula", "empresa", "contacto"],
        },
        {
          model: Area,
          attributes: ["nombre"],
        },
        {
          model: Usuario,
          attributes: ["nombre_completo"],
        },
      ],
      order: [["hora_ingreso", "ASC"]],
    });

    if (visitas.length === 0) {
      return res.status(404).json({
        message: `No hay visitas registradas para la fecha ${fecha}.`,
      });
    }

    const visitantesUnicos = new Set();
    visitas.forEach((v) => {
      if (v.Visitante?.cedula) visitantesUnicos.add(v.Visitante.cedula);
    });

    const resumen = {
      fecha,
      totalVisitas: visitas.length,
      totalVisitantes: visitantesUnicos.size,
      descripcion: `En la fecha ${fecha} ingresaron ${visitantesUnicos.size} persona(s) distintas, con un total de ${visitas.length} visita(s) registradas.`,
    };

    const detalle = visitas.map((v) => ({
      visitante: {
        nombres: v.Visitante?.nombres,
        cedula: v.Visitante?.cedula,
        empresa: v.Visitante?.empresa,
        contacto: v.Visitante?.contacto,
      },
      fecha: v.fecha,
      hora_ingreso: v.hora_ingreso,
      hora_salida: v.hora_salida,
      estado: v.estado,
      area: v.Area?.nombre,
      motivo: v.motivo,
      observacion: v.observacion,
      registrado_por: v.Usuario?.nombre_completo,
    }));

    res.json({ resumen, detalle });
  } catch (error) {
    console.error("Error al generar reporte por fecha:", error);
    res
      .status(500)
      .json({ message: "Error al generar el reporte", error: error.message });
  }
};

exports.reportePorRango = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({
      message: "Se requieren las fechas inicio y fin (YYYY-MM-DD)",
    });
  }

  try {
    const visitas = await Visita.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: [
        {
          model: Visitante,
          attributes: ["nombres", "cedula", "empresa", "contacto"],
        },
        {
          model: Area,
          attributes: ["nombre"],
        },
        {
          model: Usuario,
          attributes: ["nombre_completo"],
        },
      ],
      order: [
        ["fecha", "ASC"],
        ["hora_ingreso", "ASC"],
      ],
    });

    if (visitas.length === 0) {
      return res.status(404).json({
        message: `No hay visitas registradas entre ${fechaInicio} y ${fechaFin}.`,
      });
    }

    const visitantesUnicos = new Set();
    const contadorPersonas = {};
    const contadorAreas = {};

    visitas.forEach((v) => {
      if (v.Visitante?.cedula) {
        visitantesUnicos.add(v.Visitante.cedula);

        const nombre = v.Visitante.nombres;
        contadorPersonas[nombre] = (contadorPersonas[nombre] || 0) + 1;
      }

      if (v.Area?.nombre) {
        const area = v.Area.nombre;
        contadorAreas[area] = (contadorAreas[area] || 0) + 1;
      }
    });

    const personaTop = Object.entries(contadorPersonas).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const areaTop = Object.entries(contadorAreas).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const resumen = {
      fechaInicio,
      fechaFin,
      totalVisitas: visitas.length,
      totalVisitantes: visitantesUnicos.size,
      descripcion: ` Entre las fechas ${fechaInicio} y ${fechaFin} ingresaron ${
        visitantesUnicos.size
      } persona(s) distintas, con un total de ${
        visitas.length
      } visita(s) registradas.
      
 La persona que más ingresó fue ${
   personaTop ? personaTop[0] + " (" + personaTop[1] + " veces)" : "N/A"
 }.
 El área más visitada fue ${
   areaTop ? areaTop[0] + " (" + areaTop[1] + " visitas)" : "N/A"
 }.`,
    };

    const detalle = visitas.map((v) => ({
      visitante: {
        nombres: v.Visitante?.nombres,
        cedula: v.Visitante?.cedula,
        empresa: v.Visitante?.empresa,
        contacto: v.Visitante?.contacto,
      },
      fecha: v.fecha,
      hora_ingreso: v.hora_ingreso,
      hora_salida: v.hora_salida,
      estado: v.estado,
      area: v.Area?.nombre,
      motivo: v.motivo,
      observacion: v.observacion,
      registrado_por: v.Usuario?.nombre_completo,
    }));

    res.json({ resumen, detalle });
  } catch (error) {
    console.error("Error al generar reporte por rango:", error);
    res.status(500).json({
      message: "Error al generar el reporte",
      error: error.message,
    });
  }
};
