import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reporte() {
  const [tipo, setTipo] = useState("cedula"); // "cedula" | "fecha" | "rango"
  const [input, setInput] = useState(""); // para cedula o fecha simple
  const [fechaInicio, setFechaInicio] = useState(""); // para rango
  const [fechaFin, setFechaFin] = useState(""); // para rango
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const obtenerReporte = async () => {
    // Validaciones
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
      } else if (tipo === "rango") {
        url = `https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas/reporte-por-rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Error al obtener el reporte");

      setReporte(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const generarPDF = () => {
    if (!reporte) return;

    // Para fecha simple o rango usamos landscape (horizontal), para cédula vertical
    const doc =
      tipo === "cedula" ? new jsPDF() : new jsPDF({ orientation: "landscape" });

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
        head: [
          [
            "Fecha",
            "Ingreso",
            "Salida",
            "Estado",
            "Área",
            "Motivo",
            "Observación",
            "Registrado por",
          ],
        ],
        body: (visitas || []).map((v) => [
          v.fecha,
          v.hora_ingreso || "-",
          v.hora_salida || "-",
          v.estado,
          v.area || "-",
          v.motivo || "-",
          v.observacion || "-",
          v.registrado_por || "-",
        ]),
        styles: { fontSize: 9 },
      });

      doc.save(`reporte_${visitante.cedula}.pdf`);
    } else {
      // Tanto fecha simple como rango
      // Se asume estructura similar
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

      
        styles: { fontSize: 8 },
      });

      doc.save(
        tipo === "fecha"
          ? `reporte_fecha_${resumen.fecha}.pdf`
          : `reporte_rango_${fechaInicio}_a_${fechaFin}.pdf`
      );
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Buscar Reporte</h2>

        <div className="mb-4 flex gap-2 flex-wrap items-center">
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
            className="border p-2 rounded"
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
              className="border p-2 rounded flex-grow min-w-[200px]"
            />
          )}

          {tipo === "fecha" && (
            <input
              type="date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 rounded"
            />
          )}

          {tipo === "rango" && (
            <>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border p-2 rounded"
              />
            </>
          )}

          <button
            onClick={obtenerReporte}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>

        {cargando && (
          <p className="text-gray-500 text-center">Cargando reporte...</p>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Reporte por Fecha o Rango */}
        {reporte && (tipo === "fecha" || tipo === "rango") && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Resumen {tipo === "fecha" ? "del Día" : "del Rango"}
            </h3>
            <p>
              <strong>{tipo === "fecha" ? "Fecha" : "Rango"}: </strong>
              {tipo === "fecha"
                ? reporte.resumen.fecha
                : `${fechaInicio} a ${fechaFin}`}
            </p>
            <p>
              <strong>Total visitas:</strong> {reporte.resumen.totalVisitas}
            </p>
            <p>
              <strong>Visitantes únicos:</strong>{" "}
              {reporte.resumen.totalVisitantes}
            </p>
            <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-gray-800 whitespace-pre-line">
                {reporte.resumen.descripcion}
              </p>
            </div>

            <h4 className="text-lg font-semibold mt-6 mb-2">
              Detalle de Visitas
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Nombre</th>
                    <th className="p-2 border">Cédula</th>
                    <th className="p-2 border">Contacto</th>
                    <th className="p-2 border">Empresa</th>
                    <th className="p-2 border">Fecha</th>
                    <th className="p-2 border">Ingreso</th>
                    <th className="p-2 border">Salida</th>
                    <th className="p-2 border">Área</th>
                    <th className="p-2 border">Motivo</th>
                    <th className="p-2 border">Observación</th>
                    <th className="p-2 border">Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {(reporte.detalle || []).map((v, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{v.visitante?.nombres}</td>
                      <td className="p-2 border">{v.visitante?.cedula}</td>
                      <td className="p-2 border">{v.visitante?.contacto}</td>
                      <td className="p-2 border">{v.visitante?.empresa}</td>
                      <td className="p-2 border">{v.fecha}</td>
                      <td className="p-2 border">{v.hora_ingreso || "-"}</td>
                      <td className="p-2 border">{v.hora_salida || "-"}</td>
                      <td className="p-2 border">{v.area || "-"}</td>
                      <td className="p-2 border">{v.motivo || "-"}</td>
                      <td className="p-2 border">{v.observacion || "-"}</td>
                      <td className="p-2 border">{v.registrado_por || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reporte por Cédula */}
        {reporte && tipo === "cedula" && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Visitante</h3>
            <p>
              <strong>Nombre:</strong> {reporte.visitante.nombres}
            </p>
            <p>
              <strong>Cédula:</strong> {reporte.visitante.cedula}
            </p>
            <p>
              <strong>Empresa:</strong> {reporte.visitante.empresa}
            </p>
            <p>
              <strong>Contacto:</strong> {reporte.visitante.contacto}
            </p>

            <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-gray-800 whitespace-pre-line">
                {reporte.descripcion}
              </p>
            </div>

            <h4 className="text-lg font-semibold mt-6 mb-2">Visitas</h4>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Fecha</th>
                    <th className="p-2 border">Ingreso</th>
                    <th className="p-2 border">Salida</th>
                    <th className="p-2 border">Estado</th>
                    <th className="p-2 border">Área</th>
                    <th className="p-2 border">Motivo</th>
                    <th className="p-2 border">Observación</th>
                    <th className="p-2 border">Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {(reporte.visitas || []).length > 0 ? (
                    reporte.visitas.map((v, i) => (
                      <tr key={i}>
                        <td className="p-2 border">{v.fecha}</td>
                        <td className="p-2 border">{v.hora_ingreso || "-"}</td>
                        <td className="p-2 border">{v.hora_salida || "-"}</td>
                        <td className="p-2 border">{v.estado}</td>
                        <td className="p-2 border">{v.area || "-"}</td>
                        <td className="p-2 border">{v.motivo || "-"}</td>
                        <td className="p-2 border">{v.observacion || "-"}</td>
                        <td className="p-2 border">
                          {v.registrado_por || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center p-2">
                        No hay visitas registradas para esta cédula.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reporte && (
          <button
            onClick={generarPDF}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  );
}

export default Reporte;
