import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Páginas
import Home from "./pages/Home";
import EnviarMensajeria from "./pages/EnviarMensajeria";
import ProgramarMensajeria from "./pages/ProgramarMensajeria";
import AdministrarPlantillas from "./pages/AdministrarPlantillas";
import CalendarioMensajeria from "./pages/CalendarioMensajeria";
import ComingSoon from "./pages/ComingSoon";
import Configuracion from "./pages/Configuracion";
import CreateTemplate from "./pages/CreateTemplate"; 
import Login from "./pages/Login";

function App() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <Routes>
          {/* Redirigir al login si no hay sesión */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/inicio" element={<Home />} />

          {/* Mensajería */}
          <Route path="/mensajeria/enviar" element={<EnviarMensajeria />} />
          <Route path="/mensajeria/programar" element={<ProgramarMensajeria />} />
          <Route path="/mensajeria/estadisticas" element={<ComingSoon />} />

          {/* Plantillas */}
          <Route path="/crear-plantillas" element={<CreateTemplate />} />
          <Route path="/administrar-plantillas" element={<AdministrarPlantillas />} />

          {/* Calendario */}
          <Route path="/calendario" element={<CalendarioMensajeria />} />

          {/* Configuración */}
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
