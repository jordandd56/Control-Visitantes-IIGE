
import { useEffect, useMemo, useState } from "react";

// Validadores centralizados
import {
  validarCedulaEcuatoriana,
  validarPasaporte,
  normalizarPasaporte,
  PASAPORTE_MIN,
  PASAPORTE_MAX,
  validarNombrePersona,
  validarMotivo,
  validarEmpresa,
  validarEmail,
} from "./utils/validators";

const API_BASE =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas";
const API_BASE_VISITAS =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitas";
const API_BASE_VISITANTES =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/visitantes";
const API_BASE_AREAS =
  "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/areas";

/*  Helpers - */
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

    // Visitante
    nombre: v.Visitante?.nombres ?? "-",
    cedula: v.Visitante?.cedula ?? "-",
    empresa: v.Visitante?.empresa ?? "-",
    contacto: v.Visitante?.contacto ?? "-",



    // Visita
    motivo: v.motivo,
    personaVisitada: v.a_quien_visita,
    area: v.Area?.nombre ?? "-",
    fecha: v.fecha,
    hora: (v.hora_ingreso || v.hora)?.slice(0, 5),
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


export default function ControlVisitasVisual() {
  // Tabla / datos
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorFetch, setErrorFetch] = useState("");

  // Filtros tabla
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Modales
  const [modal, setModal] = useState(null);
  const [modalObservacion, setModalObservacion] = useState(null);

  // Crear/Buscar visitante y crear visita
  const [cedula, setCedula] = useState("");
  const [pasaporte, setPasaporte] = useState("");
  const [visitanteEncontrado, setVisitanteEncontrado] = useState(null);

  const [areas, setAreas] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [aQuienVisita, setAQuienVisita] = useState("");
  const [motivo, setMotivo] = useState("");

  const [registradoPor] = useState(38); // id de usuario que registra
  const [mensaje, setMensaje] = useState("");

  // Errores UI
  const [errors, setErrors] = useState({
    cedula: "",
    pasaporte: "",
    aQuienVisita: "",
    motivo: "",
    area: "",
    nombres: "",
    empresa: "",
    contacto: "",
  });

  // Cargar visitas del día
  const cargarVisitas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/obtenerVisitasDelDia`);
      if (!res.ok) throw new Error("Error al obtener visitas");
      const data = await res.json();
      setVisitas(data.map(normalizarVisita));
      setErrorFetch("");
    } catch (err) {
      console.error(err);
      setErrorFetch("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  // Cargar áreas
  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const res = await fetch(API_BASE_AREAS);
        if (!res.ok) throw new Error("Error al cargar áreas");
        const data = await res.json();
        setAreas(data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarAreas();
  }, []);

  /* -------------------- Buscar visitante por cédula/pasaporte -------------------- */
  const buscarVisitante = async () => {
    setMensaje("");
    setVisitanteEncontrado(null);

    // Validaciones previas
    const e = { ...errors };
    e.cedula = "";
    e.pasaporte = "";

    if (!cedula && !pasaporte) {
      setMensaje("Debe ingresar cédula o pasaporte");
      return;
    }
    if (cedula && !validarCedulaEcuatoriana(cedula)) {
      e.cedula = "Cédula inválida";
    }
    if (pasaporte && !validarPasaporte(pasaporte)) {
      e.pasaporte = `Pasaporte inválido (A–Z, 0–9, ${PASAPORTE_MIN}-${PASAPORTE_MAX})`;
    }
    setErrors(e);
    if (e.cedula || e.pasaporte) return;

    try {
      const params = new URLSearchParams();
      if (cedula) params.append("cedula", cedula);
      if (pasaporte) params.append("pasaporte", normalizarPasaporte(pasaporte));

      const res = await fetch(
        `${API_BASE_VISITANTES}/buscarVisitante?${params.toString()}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          setMensaje(
            "Visitante no encontrado, por favor ingrese los datos para registrar"
          );
          return;
        }
        throw new Error("Error en la búsqueda");
      }

      const data = await res.json();
      setVisitanteEncontrado(data);
      setMensaje("Visitante encontrado");
    } catch (err) {
      console.error(err);
      setMensaje("Error al buscar visitante");
    }
  };

  /*  Agregar visitante (nuevo)- */
  const agregarVisitante = async (nombres, empresa, contacto) => {
    setMensaje("");
    const e = { ...errors };

    e.nombres = validarNombrePersona(nombres);
    e.empresa = validarEmpresa(empresa);
    e.contacto = validarEmail(contacto);

    setErrors(e);
    if (e.nombres || e.empresa || e.contacto) return;

    try {
      const body = {};

      if (cedula) {
        if (!validarCedulaEcuatoriana(cedula)) {
          setMensaje("Cédula inválida.");
          return;
        }
        body.cedula = cedula;
      }

      if (pasaporte) {
        if (!validarPasaporte(pasaporte)) {
          setMensaje(
            `Pasaporte inválido: use ${PASAPORTE_MIN}-${PASAPORTE_MAX} caracteres alfanuméricos.`
          );
          return;
        }
        body.pasaporte = normalizarPasaporte(pasaporte);
      }

      body.nombres = nombres.trim();
      body.empresa = empresa.trim();
      body.contacto = contacto.trim();

      const res = await fetch(`${API_BASE_VISITANTES}/agregarVisitante`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al agregar visitante");
      const data = await res.json();
      setVisitanteEncontrado(data.visitante);
      setMensaje("Visitante agregado correctamente");
    } catch (err) {
      console.error(err);
      setMensaje("Error al agregar visitante");
    }
  };

  /*  Crear visita */
  const crearVisita = async () => {
    setMensaje("");

    const e = { ...errors };
    e.aQuienVisita = validarNombrePersona(aQuienVisita);
    e.motivo = validarMotivo(motivo);
    e.area = areaSeleccionada ? "" : "Seleccione un área";
    setErrors(e);

    if (e.aQuienVisita || e.motivo || e.area) return;

    if (!visitanteEncontrado) {
      setMensaje("Busque o agregue un visitante antes de crear la visita");
      return;
    }

    try {
      const body = {
        visitante_id: visitanteEncontrado.id,
        a_quien_visita: aQuienVisita.trim(),
        area_id: parseInt(areaSeleccionada, 10),
        motivo: motivo.trim(),
        registrado_por: registradoPor,
        observacion: "Visita programada",
      };

      const res = await fetch(`${API_BASE_VISITAS}/crearVisita`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al crear visita");
      const data = await res.json();
      setMensaje("Visita creada correctamente con id " + data.id);

      // Limpiar formulario
      setCedula("");
      setPasaporte("");
      setVisitanteEncontrado(null);
      setAreaSeleccionada("");
      setAQuienVisita("");
      setMotivo("");

      await cargarVisitas();
    } catch (err) {
      console.error(err);
      setMensaje("Error al crear visita");
    }
  };

  // Carga inicial de visitas
  useEffect(() => {
    cargarVisitas();
  }, []);

  // Actualizar estado visita
  const actualizarEstado = async (id, estado, observacion = "") => {
    try {
      const body = { estado };
      if (estado === "salida") {
        body.observacion = observacion.trim();
      }

      const res = await fetch(`${API_BASE}/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");

      const { visita } = await res.json();
      const vNorm = normalizarVisita(visita);
      setVisitas((prev) => prev.map((x) => (x.id === id ? vNorm : x)));
      setModalObservacion(null);
    } catch (err) {
      alert("No se pudo actualizar estado");
    }
  };

  // KPIs
  const hoyISO = new Date().toISOString().slice(0, 10);
  const total = visitas.length;
  const hoy = visitas.filter((v) => v.fecha === hoyISO).length;
  const pendientes = visitas.filter((v) => v.estado === "Pendiente").length;
  const activas = visitas.filter((v) => v.ingreso && !v.salida).length;

  // Filtros visuales
  const filt = useMemo(
    () =>
      visitas.filter((v) => {
        const str = (s = "") => s.toLowerCase();
        if (
          busqueda &&
          ![v.nombre, v.motivo, v.personaVisitada, v.area].some((c) =>
            str(c).includes(str(busqueda))
          )
        )
          return false;
        if (filtroEstado && v.estado !== filtroEstado) return false;
        if (filtroArea && v.area !== filtroArea) return false;
        return true;
      }),
    [visitas, busqueda, filtroEstado, filtroArea]
  );

  const totalPages = Math.max(1, Math.ceil(filt.length / filasPorPagina));
  const page = Math.min(pagina, totalPages);
  const pageRows = filt.slice(
    (page - 1) * filasPorPagina,
    page * filasPorPagina
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-indigo-50 via-white to-indigo-50">
      <h1 className="text-center text-4xl font-bold text-indigo-700 mb-8">
        Control de Visitas
      </h1>

      {errorFetch && (
        <p className="text-center text-red-600 mb-4">{errorFetch}</p>
      )}

      <Tarjetas
        total={total}
        hoy={hoy}
        pendientes={pendientes}
        activas={activas}
        areas={[...new Set(visitas.map((v) => v.area))].length}
      />

      <BarraFiltros
        {...{
          busqueda,
          setBusqueda,
          filtroEstado,
          setFiltroEstado,
          filtroArea,
          setFiltroArea,
          filasPorPagina,
          setFilasPorPagina,
          visitas,
          exportCSV,
          filasExport: filt,
          reset: () => {
            setBusqueda("");
            setFiltroEstado("");
            setFiltroArea("");
          },
        }}
      />

      <div>
        {/* Sección para buscar/agregar visitante y crear visita */}
        <section className="bg-white rounded-xl p-6 shadow my-6 border border-indigo-100">
          <h2 className="text-xl font-bold mb-4 text-indigo-800">
            Buscar o Agregar Visitante
          </h2>

          {/* Búsqueda por cédula/pasaporte */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                placeholder="Cédula"
                value={cedula}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setCedula(v);
                  setErrors((p) => ({
                    ...p,
                    cedula:
                      v && v.length === 10 && !validarCedulaEcuatoriana(v)
                        ? "Cédula inválida"
                        : "",
                  }));
                }}
                className={`border p-2 rounded w-full ${
                  errors.cedula ? "border-red-500 ring-1 ring-red-300" : ""
                }`}
              />
              {errors.cedula && (
                <p className="text-sm text-red-600 mt-1">{errors.cedula}</p>
              )}
            </div>

            <div className="flex-1">
              <input
                placeholder="Pasaporte"
                value={pasaporte}
                onChange={(e) => {
                  const v = normalizarPasaporte(e.target.value).slice(0, 12);
                  setPasaporte(v);
                  setErrors((p) => ({
                    ...p,
                    pasaporte:
                      v && !validarPasaporte(v)
                        ? `Pasaporte inválido (A–Z, 0–9, ${PASAPORTE_MIN}-${PASAPORTE_MAX})`
                        : "",
                  }));
                }}
                className={`border p-2 rounded w-full ${
                  errors.pasaporte ? "border-red-500 ring-1 ring-red-300" : ""
                }`}
              />
              {errors.pasaporte && (
                <p className="text-sm text-red-600 mt-1">{errors.pasaporte}</p>
              )}
            </div>

            <button
              onClick={buscarVisitante}
              className="bg-indigo-600 text-white px-4 rounded h-10 md:h-auto"
            >
              Buscar
            </button>
          </div>

          {mensaje && (
            <p
              className={`mb-4 ${
                mensaje.toLowerCase().includes("error")
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              {mensaje}
            </p>
          )}

          {/* Datos del visitante encontrado o formulario de registro */}
          {visitanteEncontrado ? (
            <div className="bg-blue-50 border border-indigo-100 p-4 rounded-xl">
              <div className="grid md:grid-cols-3 gap-2 text-sm">
                <p>
                  <b>ID:</b> {visitanteEncontrado.id}
                </p>
                <p>
                  <b>Cédula:</b> {visitanteEncontrado.cedula || "-"}
                </p>
                <p>
                  <b>Pasaporte:</b> {visitanteEncontrado.pasaporte || "-"}
                </p>
                <p className="md:col-span-3">
                  <b>Nombre:</b> {visitanteEncontrado.nombres}
                </p>
                <p className="md:col-span-3">
                  <b>Empresa:</b> {visitanteEncontrado.empresa}
                </p>
                <p className="md:col-span-3">
                  <b>Contacto:</b> {visitanteEncontrado.contacto}
                </p>
              </div>

              <h3 className="mt-4 font-semibold text-indigo-800">
                Crear visita
              </h3>

              <input
                type="text"
                placeholder="A quién visita"
                value={aQuienVisita}
                onChange={(e) => {
                  setAQuienVisita(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    aQuienVisita: validarNombrePersona(e.target.value),
                  }));
                }}
                className={`border p-2 rounded w-full mb-2 ${
                  errors.aQuienVisita
                    ? "border-red-500 ring-1 ring-red-300"
                    : ""
                }`}
              />
              {errors.aQuienVisita && (
                <p className="text-sm text-red-600 -mt-1 mb-2">
                  {errors.aQuienVisita}
                </p>
              )}

              <input
                type="text"
                placeholder="Motivo"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    motivo: validarMotivo(e.target.value),
                  }));
                }}
                className={`border p-2 rounded w-full mb-2 ${
                  errors.motivo ? "border-red-500 ring-1 ring-red-300" : ""
                }`}
              />
              {errors.motivo && (
                <p className="text-sm text-red-600 -mt-1 mb-2">
                  {errors.motivo}
                </p>
              )}

              <select
                value={areaSeleccionada}
                onChange={(e) => {
                  setAreaSeleccionada(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    area: e.target.value ? "" : "Seleccione un área",
                  }));
                }}
                className={`border p-2 rounded w-full mb-2 ${
                  errors.area ? "border-red-500 ring-1 ring-red-300" : ""
                }`}
              >
                <option value="">Seleccione un área</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
              {errors.area && (
                <p className="text-sm text-red-600 -mt-1 mb-2">{errors.area}</p>
              )}

              <button
                onClick={crearVisita}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Crear Visita
              </button>
            </div>
          ) : (
            mensaje.includes("no encontrado") && (
              <FormularioAgregarVisitante
                agregarVisitante={agregarVisitante}
                errors={errors}
                setErrors={setErrors}
              />
            )
          )}
        </section>
      </div>

      {loading ? (
        <p className="text-center mt-10 text-indigo-600">Cargando…</p>
      ) : (
        <Tabla
          rows={pageRows}
          onIngreso={(id) => actualizarEstado(id, "ingreso")}
          onSalida={(id, nombre) => setModalObservacion({ id, nombre })}
          onDetalle={setModal}
        />
      )}

      {totalPages > 1 && (
        <Paginacion page={page} setPage={setPagina} total={totalPages} />
      )}

      {modal && <ModalVisita detalle={modal} onClose={() => setModal(null)} />}

      {modalObservacion && (
        <ModalObservacion
          data={modalObservacion}
          onCancel={() => setModalObservacion(null)}
          onConfirm={(obs) =>
            actualizarEstado(modalObservacion.id, "salida", obs)
          }
        />
      )}
    </div>
  );
}

/* Subcomponentes  */

const Card = ({ icon, color, label, value }) => (
  <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
    <span className={`text-${color}-500 text-4xl mb-1`}>{icon}</span>
    <p className="uppercase text-gray-500 text-xs font-semibold mb-1">
      {label}
    </p>
    <p className={`text-${color}-700 text-2xl font-extrabold`}>{value}</p>
  </div>
);

const Tarjetas = ({ total, hoy, pendientes, activas, areas }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
    <Card icon="👥" color="indigo" label="Total" value={total} />
    <Card icon="📅" color="green" label="Hoy" value={hoy} />
    <Card icon="⏳" color="yellow" label="Por Ingresar" value={pendientes} />
    <Card icon="🚪" color="blue" label="Activas" value={activas} />
    <Card icon="🏢" color="purple" label="Áreas" value={areas} />
  </div>
);

function BarraFiltros({
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  filtroArea,
  setFiltroArea,
  filasPorPagina,
  setFilasPorPagina,
  visitas,
  exportCSV,
  filasExport,
  reset,
}) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-6">
      <input
        className="border border-indigo-300 rounded px-3 py-2 shadow-sm"
        placeholder="Buscar…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <select
        className="border border-indigo-300 rounded px-3 py-2 shadow-sm"
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
      >
        <option value="">Todos los estados</option>
        {["Pendiente", "Aprobado", "Rechazado", "Salió"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="border border-indigo-300 rounded px-3 py-2 shadow-sm"
        value={filtroArea}
        onChange={(e) => setFiltroArea(e.target.value)}
      >
        <option value="">Todas las áreas</option>
        {[...new Set(visitas.map((v) => v.area))].map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <select
        className="border border-indigo-300 rounded px-3 py-2 shadow-sm"
        value={filasPorPagina}
        onChange={(e) => setFilasPorPagina(Number(e.target.value))}
      >
        {[5, 10, 20].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
      <button
        onClick={reset}
        className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded"
      >
        Limpiar
      </button>
      {/* <button onClick={() => exportCSV(filasExport)} className="bg-indigo-600 text-white px-3 py-2 rounded">Exportar CSV</button> */}
    </div>
  );
}

function Tabla({ rows, onIngreso, onSalida, onDetalle }) {
  if (rows.length === 0)
    return <p className="text-center text-gray-500">Sin registros</p>;
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border border-indigo-100">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-indigo-50 border-b border-indigo-200">
          <tr>
            {[
              "Visitante",
              "Empresa",
              "Contacto",
              "Motivo",
              "Persona",
              "Área",
              "Fecha",
              "Hora",
              "Estado",
              "Ingreso",
              "Salida",
              "Acciones",
            ].map((c) => (
              <th key={c} className="p-3 text-left font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-indigo-100 hover:bg-indigo-50"
            >
              <td className="p-3 cursor-pointer" onClick={() => onDetalle(r)}>
                {r.nombre}
              </td>
              <td className="p-3">{r.empresa}</td>
              <td className="p-3">{r.contacto}</td>
              <td className="p-3">{r.motivo}</td>
              <td className="p-3">{r.personaVisitada}</td>
              <td className="p-3">{r.area}</td>
              <td className="p-3">{r.fecha}</td>
              <td className="p-3">{r.hora ? r.hora.slice(0, 5) : "-"}</td>
              <td className="p-3 text-center">
                <span
                  className={`${
                    bkColor[r.estado]
                  } text-white text-xs px-2 py-1 rounded-full`}
                >
                  {r.estado}
                </span>
              </td>
              <td className="p-3 text-center">
                {r.ingreso ? r.ingreso.slice(0, 5) : "-"}
              </td>
              <td className="p-3 text-center">
                {r.salida ? r.salida.slice(0, 5) : "-"}
              </td>
              <td className="p-3 space-x-1">
                {r.estado === "Pendiente" && (
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded"
                    onClick={() => onIngreso(r.id)}
                  >
                    Ingresar
                  </button>
                )}
                {r.estado === "Aprobado" && !r.salida && (
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => onSalida(r.id, r.nombre)}
                  >
                    Salir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ModalObservacion = ({ data, onCancel, onConfirm }) => {
  const [texto, setTexto] = useState("");
  const [ningunaObs, setNingunaObs] = useState(false);

  const confirmar = () => {
    if (!ningunaObs && !texto.trim()) {
      alert(
        "Por favor, escriba una observación o marque 'Ninguna observación'."
      );
      return;
    }
    onConfirm(ningunaObs ? "Ninguna observación" : texto.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-indigo-700 mb-4">
          Observación de salida
        </h2>
        <p className="mb-2">
          Visitante: <b>{data.nombre}</b>
        </p>

        <label className="inline-flex items-center mb-3">
          <input
            type="checkbox"
            checked={ningunaObs}
            onChange={() => setNingunaObs(!ningunaObs)}
            className="mr-2"
          />
          Ninguna observación
        </label>

        <textarea
          className="w-full border border-gray-300 rounded p-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Escriba aquí la observación de salida..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={ningunaObs}
        />

        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Confirmar salida
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalVisita = ({ detalle, onClose }) => {
  const r = detalle;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-indigo-700 text-2xl font-bold mb-2">{r.nombre}</h2>
        <p className="mb-1">
          <b>Cedula:</b> {r.cedula}
        </p>
        <p className="mb-1">
          <b>Empresa:</b> {r.empresa}
        </p>
        <p className="mb-1">
          <b>Contacto:</b> {r.contacto}
        </p>
        <p className="mb-1">
          <b>Motivo:</b> {r.motivo}
        </p>
        <p className="mb-1">
          <b>Persona visitada:</b> {r.personaVisitada}
        </p>
        <p className="mb-1">
          <b>Área:</b> {r.area}
        </p>
        <p className="mb-1">
          <b>Fecha:</b> {r.fecha} - <b>Hora:</b> {r.hora}
        </p>
        <p className="mb-1">
          <b>Ingreso:</b> {r.ingreso ?? "-"} - <b>Salida:</b> {r.salida ?? "-"}
        </p>
        <p className="mb-1">
          <b>Estado:</b>{" "}
          <span
            className={`${
              bkColor[r.estado]
            } text-white text-xs px-2 py-1 rounded-full`}
          >
            {r.estado}
          </span>
        </p>
        <p className="mb-1">
          <b>Observaciones:</b> {r.observaciones ?? "-"}
        </p>

        <p className="mt-2 text-right text-xs text-gray-400">
          Registrado por ID: {r.registradoPor}
        </p>
      </div>
    </div>
  );
};

function Paginacion({ page, setPage, total }) {
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);
  return (
    <div className="flex justify-center mt-6 gap-1">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded ${
            p === page
              ? "bg-indigo-600 text-white"
              : "bg-white border text-indigo-600"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function FormularioAgregarVisitante({ agregarVisitante, errors, setErrors }) {
  const [nombres, setNombres] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [contacto, setContacto] = useState("");

  return (
    <div className="border p-4 rounded-xl bg-gray-50 my-4">
      <h3 className="font-semibold mb-2 text-indigo-800">
        Registrar nuevo visitante
      </h3>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Nombres completos"
          value={nombres}
          onChange={(e) => {
            setNombres(e.target.value);
            setErrors((p) => ({
              ...p,
              nombres: validarNombrePersona(e.target.value),
            }));
          }}
          className={`border p-2 w-full rounded ${
            errors.nombres ? "border-red-500 ring-1 ring-red-300" : ""
          }`}
        />
        {errors.nombres && (
          <p className="text-sm text-red-600 mt-1">{errors.nombres}</p>
        )}
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Empresa"
          value={empresa}
          onChange={(e) => {
            setEmpresa(e.target.value);
            setErrors((p) => ({
              ...p,
              empresa: validarEmpresa(e.target.value),
            }));
          }}
          className={`border p-2 w-full rounded ${
            errors.empresa ? "border-red-500 ring-1 ring-red-300" : ""
          }`}
        />
        {errors.empresa && (
          <p className="text-sm text-red-600 mt-1">{errors.empresa}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Email"
          value={contacto}
          onChange={(e) => {
            setContacto(e.target.value);
            setErrors((p) => ({
              ...p,
              contacto: validarEmail(e.target.value),
            }));
          }}
          className={`border p-2 w-full rounded ${
            errors.contacto ? "border-red-500 ring-1 ring-red-300" : ""
          }`}
        />
        {errors.contacto && (
          <p className="text-sm text-red-600 mt-1">{errors.contacto}</p>
        )}
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => agregarVisitante(nombres, empresa, contacto)}
      >
        Agregar Visitante
      </button>
    </div>
  );
}
