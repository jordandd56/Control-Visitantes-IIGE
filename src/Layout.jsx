import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  FileBarChart2,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rol = usuario?.rol_id === 1 ? "admin" : "Guardia";

  const menuItems = [
    { name: "Inicio", path: "/inicio", icon: <Home size={20} /> },
  ];

  if (rol === "admin") {
    menuItems.push(
      { name: "Reportes", path: "/reportes", icon: <FileBarChart2 size={20} /> },
      { name: "Usuarios", path: "/usuarios", icon: <Users size={20} /> }
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Botón hamburguesa solo en móviles */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">IIGE - Panel</h2>
        <button onClick={() => setSidebarAbierto(!sidebarAbierto)}>
          {sidebarAbierto ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Sidebar responsive */}
      <aside
        className={`${
          sidebarAbierto ? "block" : "hidden"
        } md:block w-full md:w-64 bg-blue-800 text-white flex flex-col justify-between shadow-xl md:h-full fixed md:static z-40`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8 text-center tracking-wide hidden md:block">
            IIGE - Panel
          </h2>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-600 ${
                      location.pathname === item.path ? "bg-blue-600" : ""
                    }`}
                    onClick={() => setSidebarAbierto(false)} // Cierra menú en móviles
                  >
                    {item.icon}
                    <span className="text-base">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-700 hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
          <p className="text-xs text-center mt-3 text-blue-300">
            &copy; 2025 IIGE
          </p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto p-4 md:p-6 mt-[70px] md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
