import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Asegúrate de instalar `lucide-react`
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://mi-backend-nodejs-c0d5dre0cwgughb4.centralus-01.azurewebsites.net/api/usuarios/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario,
            contrasena,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setMensajeError(errorData.message || "Error desconocido");
        return;
      }

      const data = await response.json();

      navigate("/inicio");
    } catch (err) {
      setError("Error al conectar con el servidor");
      console.error(err);
    }
  };

  return (
    <>
      {/* Contenedor principal del formulario de login */}
      <div className="min-h-screen flex flex-col md:flex-row  bg-gradient-to-br from-55% to-blue-500 ">
        {/* Imagen */}
        <div className="md:w-1/2 w-full flex justify-center items-center p-4">
          <img
            src="../src/assets/imgLogin.png"
            alt="Instituto de investigación"
            className="w-[90%] h-auto object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Sección derecha: imagen o ilustración */}
        <div className="md:w-1/2 w-full  flex  items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
              Iniciar Sesión
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(e);
              }}
              className="space-y-5"
            >
              <div className="mb-5">
                <label
                  htmlFor="usuario"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Usuario
                </label>
                <input
                  type="username"
                  id="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="contraseña"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="contraseña"
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
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-red-500 text-sm mb-4 text-center">
                {mensajeError}
              </div>

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
