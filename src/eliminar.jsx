import { useState, useMemo } from "react";

// Datos simulados
const visitasMock = [
  {
    id: 1,
    nombre: "Juan Pérez",
    motivo: "Reunión de trabajo",
    fecha: "2025-07-04",
    hora: "10:30",
    contacto: "juan.perez@email.com",
    personaVisitada: "Lic. García",
    area: "Recursos Humanos",
    estado: "Pendiente",
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
    ingreso: null,
    salida: null,
    observaciones: "Trae documentos importantes",
  },
  {
    id: 2,
    nombre: "María López",
    motivo: "Entrega de documentos",
    fecha: "2025-07-04",
    hora: "11:00",
    contacto: "555-123-4567",
    personaVisitada: "Ing. Sánchez",
    area: "Administración",
    estado: "Aprobado",
    foto: "https://randomuser.me/api/portraits/women/44.jpg",
    ingreso: "10:58",
    salida: null,
    observaciones: "",
  },
  {
    id: 3,
    nombre: "Carlos Ruiz",
    motivo: "Soporte técnico",
    fecha: "2025-07-03",
    hora: "14:00",
    contacto: "carlos.ruiz@email.com",
    personaVisitada: "Depto. TI",
    area: "Tecnologías",
    estado: "Salió",
    foto: "https://randomuser.me/api/portraits/men/20.jpg",
    ingreso: "14:05",
    salida: "15:30",
    observaciones: "Reportó problema con impresora",
  },
];

// Para exportar CSV (igual que antes)
function exportCSV(data) {
  const headers = [
    "Nombre",
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
  const rows = data.map((v) => [
    v.nombre,
    v.motivo,
    v.personaVisitada,
    v.area,
    v.fecha,
    v.hora,
    v.estado,
    v.ingreso || "-",
    v.salida || "-",
    v.observaciones || "-",
  ]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = "visitas_export.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ControlVisitasVisual() {
  const [visitas, setVisitas] = useState(visitasMock);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [modalVisita, setModalVisita] = useState(null);

  // Estadísticas para tarjetas
  const totalVisitas = visitas.length;
  const visitasHoy = visitas.filter(
    (v) => v.fecha === new Date().toISOString().slice(0, 10)
  ).length;
  const pendientes = visitas.filter((v) => v.estado === "Pendiente").length;
  const activas = visitas.filter((v) => v.ingreso && !v.salida).length;

  // Visitantes frecuentes (mock: repetidos por nombre)
  const frecuentes = visitas.reduce((acc, curr) => {
    acc[curr.nombre] = (acc[curr.nombre] || 0) + 1;
    return acc;
  }, {});
  const visitantesFrecuentes = Object.entries(frecuentes)
    .filter(([_, count]) => count > 1)
    .map(([nombre]) => nombre);

  // Filtrar visitas según búsqueda y filtros
  const visitasFiltradas = useMemo(() => {
    return visitas.filter((v) => {
      if (
        busqueda &&
        !(
          v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          v.motivo.toLowerCase().includes(busqueda.toLowerCase()) ||
          v.personaVisitada.toLowerCase().includes(busqueda.toLowerCase()) ||
          v.area.toLowerCase().includes(busqueda.toLowerCase())
        )
      )
        return false;
      if (filtroEstado && v.estado !== filtroEstado) return false;
      if (filtroArea && v.area !== filtroArea) return false;
      return true;
    });
  }, [visitas, busqueda, filtroEstado, filtroArea]);

  // Paginación
  const paginasTotales = Math.ceil(visitasFiltradas.length / filasPorPagina);
  const visitasPagina = visitasFiltradas.slice(
    (pagina - 1) * filasPorPagina,
    pagina * filasPorPagina
  );

  // Marcar ingreso o salida
  const marcarIngresoSalida = (id, tipo) => {
    setVisitas((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const horaActual = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          if (tipo === "ingreso")
            return { ...v, ingreso: horaActual, estado: "Aprobado" };
          if (tipo === "salida")
            return { ...v, salida: horaActual, estado: "Salió" };
        }
        return v;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-50 p-6 font-sans">
      {/* Título */}
      <h1 className="text-4xl font-bold text-indigo-700 mb-8 text-center">
        Control de Visitas
      </h1>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
          <div className="text-indigo-500 text-5xl mb-2">👥</div>
          <div className="text-gray-500 uppercase font-semibold tracking-wide text-sm">
            Total Visitas
          </div>
          <div className="text-3xl font-extrabold text-indigo-700">
            {totalVisitas}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
          <div className="text-green-500 text-5xl mb-2">📅</div>
          <div className="text-gray-500 uppercase font-semibold tracking-wide text-sm">
            Visitas Hoy
          </div>
          <div className="text-3xl font-extrabold text-green-700">
            {visitasHoy}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
          <div className="text-yellow-400 text-5xl mb-2">⏳</div>
          <div className="text-gray-500 uppercase font-semibold tracking-wide text-sm">
            Pendientes
          </div>
          <div className="text-3xl font-extrabold text-yellow-600">
            {pendientes}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
          <div className="text-blue-500 text-5xl mb-2">🚪</div>
          <div className="text-gray-500 uppercase font-semibold tracking-wide text-sm">
            Visitas Activas
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{activas}</div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
          <div className="text-purple-500 text-5xl mb-2">⭐</div>
          <div className="text-gray-500 uppercase font-semibold tracking-wide text-sm">
            Visitantes Frecuentes
          </div>
          <div className="text-3xl font-extrabold text-purple-700">
            {visitantesFrecuentes.length || "0"}
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap items-center gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Buscar por nombre, motivo, área..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          className="border border-indigo-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full max-w-xs"
        />
        <select
          className="border border-indigo-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Salió">Salió</option>
        </select>
        <select
          className="border border-indigo-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={filtroArea}
          onChange={(e) => {
            setFiltroArea(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todas las áreas</option>
          {[...new Set(visitas.map((v) => v.area))].map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        <select
          className="border border-indigo-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={filasPorPagina}
          onChange={(e) => {
            setFilasPorPagina(Number(e.target.value));
            setPagina(1);
          }}
        >
          {[5, 10, 20].map((num) => (
            <option key={num} value={num}>
              Mostrar {num}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setBusqueda("");
            setFiltroEstado("");
            setFiltroArea("");
            setPagina(1);
          }}
          className="bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-200 transition"
          title="Limpiar filtros"
        >
          Limpiar filtros
        </button>
        <button
          onClick={() => exportCSV(visitasFiltradas)}
          className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          title="Exportar visitas filtradas a CSV"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-indigo-100">
        <table className="min-w-full border-collapse text-gray-700 text-sm">
          <thead className="bg-indigo-50 border-b border-indigo-200">
            <tr>
              <th className="p-3 text-left font-semibold">Visitante</th>
              <th className="p-3 text-left font-semibold">Motivo</th>
              <th className="p-3 text-left font-semibold">Persona Visitada</th>
              <th className="p-3 text-left font-semibold">Área</th>
              <th className="p-3 text-left font-semibold">Fecha</th>
              <th className="p-3 text-left font-semibold">Hora</th>
              <th className="p-3 text-center font-semibold">Estado</th>
              <th className="p-3 text-center font-semibold">Ingreso</th>
              <th className="p-3 text-center font-semibold">Salida</th>
              <th className="p-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visitasPagina.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-6">
                  No hay visitas para mostrar.
                </td>
              </tr>
            ) : (
              visitasPagina.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-indigo-100 hover:bg-indigo-50 transition cursor-pointer"
                  onClick={() => setModalVisita(v)}
                >
                  <td className="p-3 flex items-center space-x-3">
                    <img
                      src={v.foto}
                      alt={v.nombre}
                      className="w-10 h-10 rounded-full shadow-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-indigo-700">
                        {v.nombre}
                      </p>
                      <p className="text-xs text-indigo-400">{v.contacto}</p>
                    </div>
                  </td>
                  <td className="p-3">{v.motivo}</td>
                  <td className="p-3">{v.personaVisitada}</td>
                  <td className="p-3">{v.area}</td>
                  <td className="p-3">{v.fecha}</td>
                  <td className="p-3">{v.hora}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs shadow-sm ${
                        v.estado === "Pendiente"
                          ? "bg-yellow-400"
                          : v.estado === "Aprobado"
                          ? "bg-green-500"
                          : v.estado === "Rechazado"
                          ? "bg-red-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {v.estado}
                    </span>
                  </td>
                  <td className="p-3 text-center">{v.ingreso || "-"}</td>
                  <td className="p-3 text-center">{v.salida || "-"}</td>
                  <td className="p-3 text-center space-x-2">
                    {v.estado === "Pendiente" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarIngresoSalida(v.id, "ingreso");
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        title={`Marcar ingreso de ${v.nombre}`}
                      >
                        Ingresar
                      </button>
                    )}
                    {v.estado === "Aprobado" && !v.salida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarIngresoSalida(v.id, "salida");
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        title={`Marcar salida de ${v.nombre}`}
                      >
                        Salir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-center space-x-3">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className={`px-4 py-2 rounded-lg border font-semibold transition ${
            pagina === 1
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "text-indigo-700 border-indigo-700 hover:bg-indigo-100"
          }`}
          aria-label="Página anterior"
        >
          ← Anterior
        </button>
        <span className="px-4 py-2 font-semibold text-indigo-700">
          Página {pagina} de {paginasTotales || 1}
        </span>
        <button
          disabled={pagina === paginasTotales || paginasTotales === 0}
          onClick={() => setPagina(pagina + 1)}
          className={`px-4 py-2 rounded-lg border font-semibold transition ${
            pagina === paginasTotales || paginasTotales === 0
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "text-indigo-700 border-indigo-700 hover:bg-indigo-100"
          }`}
          aria-label="Página siguiente"
        >
          Siguiente →
        </button>
      </div>

      {/* Modal detalles */}
      {modalVisita && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setModalVisita(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalVisita(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-xl"
              title="Cerrar modal"
            >
              ×
            </button>
            <div className="flex items-center space-x-6 mb-4">
              <img
                src={modalVisita.foto}
                alt={modalVisita.nombre}
                className="w-20 h-20 rounded-full object-cover shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold text-indigo-700">
                  {modalVisita.nombre}
                </h2>
                <p className="text-indigo-500 italic">{modalVisita.contacto}</p>
                <p className="mt-1 font-semibold">Área: {modalVisita.area}</p>
                <p className="font-semibold">
                  Persona visitada: {modalVisita.personaVisitada}
                </p>
              </div>
            </div>
            <hr className="mb-4" />
            <p>
              <strong>Motivo:</strong> {modalVisita.motivo}
            </p>
            <p>
              <strong>Fecha:</strong> {modalVisita.fecha}
            </p>
            <p>
              <strong>Hora:</strong> {modalVisita.hora}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded-full text-white font-semibold text-xs shadow-sm ${
                  modalVisita.estado === "Pendiente"
                    ? "bg-yellow-400"
                    : modalVisita.estado === "Aprobado"
                    ? "bg-green-500"
                    : modalVisita.estado === "Rechazado"
                    ? "bg-red-600"
                    : "bg-gray-400"
                }`}
              >
                {modalVisita.estado}
              </span>
            </p>
            <p>
              <strong>Ingreso:</strong> {modalVisita.ingreso || "-"}
            </p>
            <p>
              <strong>Salida:</strong> {modalVisita.salida || "-"}
            </p>
            <p>
              <strong>Observaciones:</strong>{" "}
              {modalVisita.observaciones || "Ninguna"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
