import { useState, useEffect } from "react";
import { Plus, Pencil } from "lucide-react";

export default function PanelGuardias() {
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 6;

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    usuario: "",
    contrasena: "",
    rol_id: "",
    codigoVerificacion: "", // Nuevo campo para código de verificación
  });
  const [errors, setErrors] = useState({});

  const indicePrimeraFila = indiceUltimaFila - filasPorPagina;
  const filasMostradas = usuarios.slice(indicePrimeraFila, indiceUltimaFila);
  const totalPaginas = Math.ceil(usuarios.length / filasPorPagina);

  
  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/usuarios/obtenerUsuarios"
      );
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const datos = await res.json();
      setUsuarios(datos);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerRoles = async () => {
    try {
      const res = await fetch(
        "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/roles"
      );
      if (!res.ok) throw new Error("Error al obtener roles");
      const datos = await res.json();
      setRoles(datos);
    } catch (err) {
      console.error("Error al obtener roles:", err);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setFormData({
      nombre_completo: "",
      usuario: "",
      contrasena: "",
      rol_id: "",
      codigoVerificacion: "",
    });
    setErrors({});
    setEditMode(false);
    setCurrentUserId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple para usuario en creación
    if (formData.usuario.trim() === "" && !editMode) {
      setErrors({ usuario: "El nombre de usuario no puede estar vacío." });
      return;
    }

    if (editMode) {
      // Validar contraseña y código de verificación para actualización
      if (formData.contrasena.trim() === "") {
        setErrors({
          contrasena: "La contraseña no puede estar vacía al actualizar.",
        });
        return;
      }
      if (formData.codigoVerificacion.trim() === "") {
        setErrors({
          codigoVerificacion: "El código de verificación es obligatorio.",
        });
        return;
      }
    }

    try {
      if (editMode) {
        // En modo edición, actualizamos solo la contraseña con código de verificación
        const res = await fetch(
          `https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/usuarios/actualizarContrasena/${currentUserId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nuevaContrasena: formData.contrasena,
              codigoVerificacion: formData.codigoVerificacion,
            }),
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Error al actualizar la contraseña"
          );
        }
      } else {
        // En modo creación, creamos usuario nuevo
        const res = await fetch(
          "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/usuarios/agregar",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (!res.ok) throw new Error("Error al registrar usuario");
      }

      await obtenerUsuarios(); // Refrescar tabla
      resetModal(); // Cerrar modal y limpiar formulario
    } catch (err) {
      console.error("Error en el registro / actualización:", err);
      setErrors({ general: err.message });
    }
  };

 

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-md">
        {/* Encabezado */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Guardias
          </h1>
          <button
            onClick={() => {
              setEditMode(false);
              setCurrentUserId(null);
              setFormData({
                nombre_completo: "",
                usuario: "",
                contrasena: "",
                rol_id: "",
                codigoVerificacion: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <Plus size={18} /> Agregar guardia
          </button>
        </div>

        {/* Mensajes de carga y error */}
        {loading && <p className="text-center">Cargando usuarios…</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {errors.general && (
          <p className="mb-4 text-center text-red-600">{errors.general}</p>
        )}

        {/* Tabla de usuarios */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] overflow-hidden rounded-xl">
                <thead className="bg-blue-600 text-left text-white">
                  <tr>
                    <th className="px-4 py-3">Nombre completo</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filasMostradas.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{u.nombre_completo}</td>
                      <td className="px-4 py-3">{u.usuario}</td>
                      <td className="px-4 py-3">
                        {u.rol?.nombre || "Sin rol"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          title="Editar contraseña"
                          className="rounded-md p-2 text-blue-600 transition hover:text-blue-800"
                          onClick={() => handleEditClick(u)}
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de paginación */}
            <div className="mt-4 flex justify-center space-x-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
                className={`rounded px-3 py-1 ${
                  paginaActual === 1
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-blue-600 text-white"
                }`}
              >
                Anterior
              </button>
              {[...Array(totalPaginas)].map((_, idx) => {
                const numPagina = idx + 1;
                return (
                  <button
                    key={numPagina}
                    onClick={() => setPaginaActual(numPagina)}
                    className={`rounded px-3 py-1 ${
                      paginaActual === numPagina
                        ? "bg-blue-700 text-white"
                        : "bg-blue-300 text-blue-800"
                    }`}
                  >
                    {numPagina}
                  </button>
                );
              })}
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
                className={`rounded px-3 py-1 ${
                  paginaActual === totalPaginas
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-blue-600 text-white"
                }`}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal para agregar o editar */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              {editMode ? "Editar la clave " : "Agregar guardia"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* En modo creación mostramos más campos */}
              {!editMode && (
                <>
                  <input
                    type="text"
                    name="nombre_completo"
                    placeholder="Nombre completo"
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="usuario"
                    placeholder="Usuario"
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    required
                  />
                </>
              )}

              {/* Contraseña siempre visible */}
              <input
                type="password"
                name="contrasena"
                placeholder={editMode ? "Nueva contraseña" : "Contraseña"}
                className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.contrasena}
                onChange={handleInputChange}
                required
              />
              {errors.contrasena && (
                <p className="text-sm text-red-600">{errors.contrasena}</p>
              )}

              {/* Código de verificación solo en edición */}
              {editMode && (
                <>
                  <input
                    type="password"
                    name="codigoVerificacion"
                    placeholder="Código de verificación"  //
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.codigoVerificacion}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.codigoVerificacion && (
                    <p className="text-sm text-red-600">
                      {errors.codigoVerificacion}
                    </p>
                  )}
                </>
              )}

              {/* Selector de rol solo en creación */}
              {!editMode && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol:
                  </label>
                  <select
                    name="rol_id"
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.rol_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {/* Botones cancelar y guardar/actualizar */}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  {editMode ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
