
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas"; // ajusta si es necesario
const API_BASE_VISITAS =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas";
const API_BASE_VISITANTES =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitantes";
const API_BASE_AREAS =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/areas";


const normalizarVisita = (v) => {
  let estadoUI = "Pendiente";
  if (v.estado === "ingreso") {
    estadoUI = v.hora_salida ? "Salió" : "Aprobado";
  } else if (v.estado === "salida") {
    estadoUI = "Salió";
  } else if (v.estado === "rechazado") {
    estadoUI = "Rechazado";
  }

  return {
    id: v.id,
    nombre: v.Visitante?.nombres ?? "-",
    empresa: v.Visitante?.empresa ?? "-",
    contacto: v.Visitante?.contacto ?? "-",
    motivo: v.motivo,
    personaVisitada: v.a_quien_visita,
    area: v.Area?.nombre ?? "-",
    fecha: v.fecha,
    hora: (v.hora_ingreso || v.hora)?.slice(0, 5), // Solo mostrar hora y minutos ya no milisegundos
    ingreso: v.hora_ingreso?.slice(0, 5),
    salida: v.hora_salida?.slice(0, 5),
    estado: estadoUI,
    observaciones: v.observacion,
    registradoPor: v.Usuario?.nombre_completo ?? "-",
  };
};

const bkColor = {
  Pendiente: "bg-yellow-400",
  Aprobado: "bg-green-500",
  Rechazado: "bg-red-600",
  Salió: "bg-gray-400",
};

function exportCSV(filas) {
  const headers = [
    "Nombre",
    "Empresa",
    "Contacto",
    "Motivo",
    "Persona Visitada",
    "Área",
    "Fecha",
    "Hora",
    "Estado",
    "Ingreso",
    "Salida",
    "Observaciones",
  ];
  const csv = [
    headers,
    ...filas.map((r) => [
      r.nombre,
      r.empresa,
      r.contacto,
      r.motivo,
      r.personaVisitada,
      r.area,
      r.fecha,
      r.hora,
      r.estado,
      r.ingreso ?? "-",
      r.salida ?? "-",
      r.observaciones ?? "-",
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  link.download = "visitas_export.csv";
  link.click();
}

