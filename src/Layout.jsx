import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, FolderKanban, FileBarChart2, LogOut } from "lucide-react";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redirigir

  const menuItems = [
    { name: "Inicio", path: "/inicio", icon: <Home size={20} /> },
    { name: "Reportes", path: "/reportes", icon: <FileBarChart2 size={20} /> },
    { name: "Usuarios", path: "/usuarios", icon: <Users size={20} /> },
  ];

  // Función para cerrar sesión
  const handleLogout = () => {
    // Aquí podrías limpiar localStorage o tokens si usaras autenticación
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col justify-between shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">
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
                  >
                    {item.icon}
                    <span className="text-base">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Botón de cerrar sesión */}
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

      {/* Área de contenido */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
