import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensajeError("");

    try {
      const response = await fetch(
        "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/usuarios/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, contrasena }),
        }
      );

      if (!response.ok) {
        let msg = "Error desconocido";
        try {
          const errorData = await response.json();
          msg = errorData.message || msg;
        } catch (_) {}
        setMensajeError(msg);
        return;
      }

      const data = await response.json();
      navigate("/inicio");
    } catch (err) {
      setMensajeError("Error al conectar con el servidor");
      console.error(err);
    }
  };

  return (
    <>
      {/* Contenedor principal del formulario de login */}
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-50 to-blue-500">
        {/* Imagen */}
        <div className="md:w-1/2 w-full flex justify-center items-center p-4">
          <img
            src="/imgLogin.png"
            alt="Login"
            className="w-[90%] h-auto object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Formulario */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
              Iniciar Sesión
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="usuario"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Usuario
                </label>
                <input
                  type="text"
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="contrasena"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-500"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {mensajeError && (
                <div className="text-red-500 text-sm mb-2 text-center">
                  {mensajeError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;