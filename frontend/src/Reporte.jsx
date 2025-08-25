import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reporte() {
  const [tipo, setTipo] = useState("cedula");
  const [input, setInput] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const obtenerReporte = async () => {
    if (tipo === "cedula" && !input) {
      setError("Por favor ingresa una cédula.");
      return;
    }
    if (tipo === "fecha" && !input) {
      setError("Por favor ingresa una fecha.");
      return;
    }
    if (tipo === "rango" && (!fechaInicio || !fechaFin)) {
      setError("Por favor ingresa ambas fechas del rango.");
      return;
    }

    setCargando(true);
    setError("");
    setReporte(null);

    try {
      let url = "";

      if (tipo === "cedula") {
        url = `https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas/reporte-por-cedula?cedula=${input}`;
      } else if (tipo === "fecha") {
        url = `https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas/reporte-por-fecha?fecha=${input}`;
      } else {
        url = `https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas/reporte-por-rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al obtener el reporte");

      setReporte(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const generarPDF = () => {
    if (!reporte) return;
    const doc = tipo === "cedula" ? new jsPDF() : new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Reporte de Visitas", 14, 20);
    let y = 30;

    if (tipo === "cedula") {
      const { visitante, descripcion, visitas } = reporte;
      doc.setFontSize(12);
      doc.text(`Nombre: ${visitante.nombres}`, 14, y);
      doc.text(`Cédula: ${visitante.cedula}`, 14, (y += 7));
      doc.text(`Empresa: ${visitante.empresa}`, 14, (y += 7));
      doc.text(`Contacto: ${visitante.contacto}`, 14, (y += 7));
      doc.setFont("normal", "italic");
      doc.text("Resumen:", 14, (y += 10));
      const split = doc.splitTextToSize(descripcion, 180);
      doc.text(split, 14, (y += 7));
      y += split.length * 5;

      autoTable(doc, {
        startY: y + 10,
        head: [[
          "Fecha", "Ingreso", "Salida", "Estado", "Área", "Motivo", "Observación", "Registrado por"
        ]],
        body: (visitas || []).map((v) => [
          v.fecha, v.hora_ingreso || "-", v.hora_salida || "-", v.estado,
          v.area || "-", v.motivo || "-", v.observacion || "-", v.registrado_por || "-"
        ]),
        styles: { fontSize: 9 }
      });

      doc.save(`reporte_${visitante.cedula}.pdf`);
    } else {
      const resumen = reporte.resumen || {};
      const detalle = reporte.detalle || [];

      doc.setFontSize(12);
      if (tipo === "fecha") {
        doc.text(`Fecha: ${resumen.fecha}`, 14, y);
      } else {
        doc.text(`Rango: ${fechaInicio} - ${fechaFin}`, 14, y);
      }
      doc.text(`Total visitas: ${resumen.totalVisitas}`, 14, (y += 7));
      doc.text(`Visitantes únicos: ${resumen.totalVisitantes}`, 14, (y += 7));
      doc.setFont("normal", "italic");
      const split = doc.splitTextToSize(resumen.descripcion || "", 250);
      doc.text(split, 14, (y += 10));
      y += split.length * 5;

      autoTable(doc, {
        startY: y + 10,
        head: [[
          "Nombre", "Cédula", "Contacto", "Empresa", "Fecha",
          "Ingreso", "Salida", "Área", "Motivo", "Observación", "Registrado por"
        ]],
        body: detalle.map((v) => [
          v.visitante?.nombres || "-", v.visitante?.cedula || "-", v.visitante?.contacto || "-",
          v.visitante?.empresa || "-", v.fecha, v.hora_ingreso || "-", v.hora_salida || "-",
          v.area || "-", v.motivo || "-", v.observacion || "-", v.registrado_por || "-"
        ]),
        styles: { fontSize: 8 }
      });

      doc.save(
        tipo === "fecha"
          ? `reporte_fecha_${resumen.fecha}.pdf`
          : `reporte_rango_${fechaInicio}_a_${fechaFin}.pdf`
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-10">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-7xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Buscar Reporte</h2>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setInput("");
              setFechaInicio("");
              setFechaFin("");
              setReporte(null);
              setError("");
            }}
            className="border p-2 rounded w-full"
          >
            <option value="cedula">Por Cédula</option>
            <option value="fecha">Por Fecha</option>
            <option value="rango">Por Rango de Fechas</option>
          </select>

          {tipo === "cedula" && (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ingrese cédula"
              className="border p-2 rounded w-full"
            />
          )}
          {tipo === "fecha" && (
            <input
              type="date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 rounded w-full"
            />
          )}
          {tipo === "rango" && (
            <>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </>
          )}

          <button
            onClick={obtenerReporte}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Buscar
          </button>
        </div>

        {cargando && <p className="text-gray-500 text-center">Cargando reporte...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Resultado */}
        {reporte && (
          <>
            {/* Resumen */}
            {tipo === "cedula" ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Visitante</h3>
                <p><strong>Nombre:</strong> {reporte.visitante.nombres}</p>
                <p><strong>Cédula:</strong> {reporte.visitante.cedula}</p>
                <p><strong>Empresa:</strong> {reporte.visitante.empresa}</p>
                <p><strong>Contacto:</strong> {reporte.visitante.contacto}</p>
                <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-gray-800 whitespace-pre-line">{reporte.descripcion}</p>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Resumen {tipo === "fecha" ? "del Día" : "del Rango"}
                </h3>
                <p><strong>Fecha: </strong>{tipo === "fecha" ? reporte.resumen.fecha : `${fechaInicio} a ${fechaFin}`}</p>
                <p><strong>Total visitas:</strong> {reporte.resumen.totalVisitas}</p>
                <p><strong>Visitantes únicos:</strong> {reporte.resumen.totalVisitantes}</p>
                <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-gray-800 whitespace-pre-line">{reporte.resumen.descripcion}</p>
                </div>
              </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full table-auto text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    {(tipo === "cedula"
                      ? ["Fecha", "Ingreso", "Salida", "Estado", "Área", "Motivo", "Observación", "Registrado por"]
                      : ["Nombre", "Cédula", "Contacto", "Empresa", "Fecha", "Ingreso", "Salida", "Área", "Motivo", "Observación", "Registrado por"]
                    ).map((th, i) => (
                      <th key={i} className="p-2 border text-left">{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(tipo === "cedula" ? reporte.visitas : reporte.detalle).map((v, i) => (
                    <tr key={i}>
                      {tipo === "cedula" ? (
                        <>
                          <td className="p-2 border">{v.fecha}</td>
                          <td className="p-2 border">{v.hora_ingreso || "-"}</td>
                          <td className="p-2 border">{v.hora_salida || "-"}</td>
                          <td className="p-2 border">{v.estado}</td>
                          <td className="p-2 border">{v.area || "-"}</td>
                          <td className="p-2 border">{v.motivo || "-"}</td>
                          <td className="p-2 border">{v.observacion || "-"}</td>
                          <td className="p-2 border">{v.registrado_por || "-"}</td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 border">{v.visitante?.nombres || "-"}</td>
                          <td className="p-2 border">{v.visitante?.cedula || "-"}</td>
                          <td className="p-2 border">{v.visitante?.contacto || "-"}</td>
                          <td className="p-2 border">{v.visitante?.empresa || "-"}</td>
                          <td className="p-2 border">{v.fecha}</td>
                          <td className="p-2 border">{v.hora_ingreso || "-"}</td>
                          <td className="p-2 border">{v.hora_salida || "-"}</td>
                          <td className="p-2 border">{v.area || "-"}</td>
                          <td className="p-2 border">{v.motivo || "-"}</td>
                          <td className="p-2 border">{v.observacion || "-"}</td>
                          <td className="p-2 border">{v.registrado_por || "-"}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón PDF */}
            <div className="flex justify-center mt-6">
              <button
                onClick={generarPDF}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
              >
                Descargar PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reporte;
