import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Usuario:", username, "Contraseña:", password);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full min-h-screen">
      {/* Imagen a la izquierda */}
      <div className="flex justify-center items-center">
        <img src="logon1.jpg" alt="logo inicial" className="object-contain w-full h-60 md:h-full" />
        </div>
      {/* Formulario a la derecha */}
      <div className="flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full sm:w-11/12 text-gray-800">
          {/* Encabezado */}
          <div className="flex justify-center items-center gap-2 mb-5">
            <h3 className="text-2xl font-bold">Control de Visitas</h3>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="user" className="mt-2 mb-1 text-sm font-medium">Usuario</label>
            <input
              id="user"
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <label htmlFor="password" className="mt-2 mb-1 text-sm font-medium">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {/* Botón de inicio */}
            <button type="submit" className="w-full bg-black text-white py-2 rounded-md font-bold mt-4 hover:bg-gray-700">
              Iniciar sesión
            </button>
          </form>

          {/* Enlaces adicionales */}
          <p className="text-xs text-center mt-3">
            <a href="#" className="text-blue-500 hover:underline">Olvidó su contraseña</a>
          </p>
          <p className="text-xs mt-3">
            ¿Aún no tiene cuenta? <a href="#" className="text-blue-500 font-bold hover:underline">Regístrese aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;