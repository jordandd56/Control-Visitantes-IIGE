import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Inicio from "./Inicio";
import Usuario from "./Usuario";
import Layout from "./Layout";
import Reporte from "./Reporte";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública sin menú lateral */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas con layout */}
        <Route path="/" element={<Layout />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="usuarios" element={<Usuario />} />
          <Route path="reportes" element={<Reporte />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
