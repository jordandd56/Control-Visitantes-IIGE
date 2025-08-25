import { useState, useEffect } from "react";
import { Plus, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  validateName,
  validatePassword,
  validateRole,
  validateUsername,
  validateDigits,
  allowOnlyLettersKeyDown,
} from "./utils/validators";

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

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario?.rol_id !== 1) navigate("/inicio");
  }, [navigate]);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    usuario: "",
    contrasena: "",
    rol_id: "",
    codigoVerificacion: "",
  });
  const [errors, setErrors] = useState({});

  const indiceUltimaFila = paginaActual * filasPorPagina;
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

    // Sanea en vivo según el campo
    if (name === "usuario") {
      // solo letras, números, punto, guion, guion_bajo
      const v = value.replace(/[^A-Za-z0-9._-]/g, "");
      setFormData((prev) => ({ ...prev, [name]: v }));
      return;
    }
    if (name === "codigoVerificacion") {
      const v = value.replace(/\D+/g, ""); // solo dígitos
      setFormData((prev) => ({ ...prev, [name]: v }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Valida un campo individual (para onBlur)
  const validateField = (name, value) => {
    let msg = "";
    if (name === "nombre_completo") msg = validateName(value);
    if (name === "usuario") msg = validateUsername(value);
    if (name === "contrasena") msg = validatePassword(value);
    if (name === "rol_id") msg = validateRole(value);
    if (name === "codigoVerificacion") msg = validateDigits(value);
    setErrors((er) => ({ ...er, [name]: msg }));
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

  // Valida todos los campos necesarios según modo
  const validateAll = () => {
    const er = {};
    if (!editMode) {
      er.nombre_completo = validateName(formData.nombre_completo);
      er.usuario = validateUsername(formData.usuario);
      er.contrasena = validatePassword(formData.contrasena);
      er.rol_id = validateRole(formData.rol_id);
    } else {
      er.contrasena = validatePassword(formData.contrasena);
      er.codigoVerificacion = validateDigits(formData.codigoVerificacion);
    }
    Object.keys(er).forEach((k) => !er[k] && delete er[k]);
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: "" }));

    if (!validateAll()) return;

    try {
      if (editMode) {
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
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Error al actualizar la contraseña"
          );
        }
      } else {
        const res = await fetch(
          "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/usuarios/agregar",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al registrar usuario");
        }
      }

      await obtenerUsuarios();
      resetModal();
    } catch (err) {
      console.error("Error en el registro / actualización:", err);
      setErrors((prev) => ({ ...prev, general: err.message || "Error" }));
    }
  };

  const handleEditClick = (u) => {
    setEditMode(true);
    setCurrentUserId(u.id);
    setFormData({
      nombre_completo: u.nombre_completo,
      usuario: u.usuario,
      contrasena: "",
      rol_id: u.rol?.id || u.rol_id || "",
      codigoVerificacion: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const creationValid =
    !editMode &&
    !validateName(formData.nombre_completo) &&
    !validateUsername(formData.usuario) &&
    !validatePassword(formData.contrasena) &&
    !validateRole(formData.rol_id);

  const editValid =
    editMode &&
    !validatePassword(formData.contrasena) &&
    !validateDigits(formData.codigoVerificacion);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Guardias</h1>
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
              setErrors({});
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <Plus size={18} /> Agregar guardia
          </button>
        </div>

        {loading && <p className="text-center">Cargando usuarios…</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {errors.general && (
          <p className="mb-4 text-center text-red-600">{errors.general}</p>
        )}

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
                    <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3">{u.nombre_completo}</td>
                      <td className="px-4 py-3">{u.usuario}</td>
                      <td className="px-4 py-3">{u.rol?.nombre || "Sin rol"}</td>
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              {editMode ? "Editar contraseña" : "Agregar guardia"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!editMode && (
                <>
                  <input
                    type="text"
                    name="nombre_completo"
                    placeholder="Nombre completo"
                    className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 ${
                      errors.nombre_completo
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    onKeyDown={allowOnlyLettersKeyDown}
                    inputMode="text"
                    autoComplete="name"
                    required
                  />
                  {errors.nombre_completo && (
                    <p className="text-sm text-red-600">{errors.nombre_completo}</p>
                  )}

                  <input
                    type="text"
                    name="usuario"
                    placeholder="Usuario"
                    className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 ${
                      errors.usuario
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={formData.usuario}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    autoComplete="username"
                    required
                  />
                  {errors.usuario && (
                    <p className="text-sm text-red-600">{errors.usuario}</p>
                  )}
                </>
              )}

              <input
                type="password"
                name="contrasena"
                placeholder={editMode ? "Nueva contraseña" : "Contraseña"}
                className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 ${
                  errors.contrasena
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                value={formData.contrasena}
                onChange={handleInputChange}
                onBlur={(e) => validateField(e.target.name, e.target.value)}
                autoComplete={editMode ? "new-password" : "new-password"}
                minLength={8}
                required
              />
              {errors.contrasena && (
                <p className="text-sm text-red-600">{errors.contrasena}</p>
              )}

              {editMode && (
                <>
                  <input
                    type="text"
                    name="codigoVerificacion"
                    placeholder="Código de verificación"
                    className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 ${
                      errors.codigoVerificacion
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={formData.codigoVerificacion}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    inputMode="numeric"
                    maxLength={12}
                    required
                  />
                  {errors.codigoVerificacion && (
                    <p className="text-sm text-red-600">
                      {errors.codigoVerificacion}
                    </p>
                  )}
                </>
              )}

              {!editMode && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol:
                  </label>
                  <select
                    name="rol_id"
                    className={`w-full rounded-md border p-3 focus:outline-none focus:ring-2 ${
                      errors.rol_id
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    value={formData.rol_id}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.rol_id && (
                    <p className="text-sm text-red-600">{errors.rol_id}</p>
                  )}
                </>
              )}

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
                  disabled={editMode ? !editValid : !creationValid}
                  className={`rounded-md px-4 py-2 text-white transition ${
                    editMode
                      ? editValid
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "cursor-not-allowed bg-blue-300"
                      : creationValid
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "cursor-not-allowed bg-blue-300"
                  }`}
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
