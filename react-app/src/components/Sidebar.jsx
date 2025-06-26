import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiMail,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiSend,
  FiClock,
  FiPlusCircle,
  FiEdit3,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMenu,
} from "react-icons/fi";

import optichatLogo from "../assets/optichat-logo.png";
import "../styles/sidebar.scss";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMensajeria, setOpenMensajeria] = useState(false);
  const [openPlantillas, setOpenPlantillas] = useState(false);
  const [searchText, setSearchText] = useState("");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const matchesSearch = (text) =>
    text.toLowerCase().includes(searchText.toLowerCase());

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sidebar__header">
        {!isCollapsed && (
          <div className="header-left">
            <img src={optichatLogo} alt="Optichat Logo" className="logo-image" />
          </div>
        )}
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FiMenu />
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="sidebar__search">
        {isCollapsed ? (
          <div className="search-icon-collapsed">
            <FiSearch />
          </div>
        ) : (
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar"
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* MENÚ PRINCIPAL */}
      <nav className="sidebar__nav">
        {!isCollapsed && <p className="nav-title">MAIN MENU</p>}
        <ul className="nav-list">
          {matchesSearch("inicio") && (
            <li>
              <Link to="/inicio" className="nav-link">
                <FiHome className="nav-icon" />
                {!isCollapsed && <span>Inicio</span>}
              </Link>
            </li>
          )}

          {/* MENSAJERÍA */}
          {(matchesSearch("mensajería") || matchesSearch("enviar") || matchesSearch("programar")) && (
            <li className="nav-item-has-submenu">
              <div
                className="nav-link submenu-toggle"
                onClick={() => setOpenMensajeria(!openMensajeria)}
              >
                <FiMail className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span>Mensajería Masiva</span>
                    {openMensajeria ? <FiChevronUp className="arrow-submenu" /> : <FiChevronDown className="arrow-submenu" />}
                  </>
                )}
              </div>
              {openMensajeria && !isCollapsed && (
                <ul className="submenu">
                  {matchesSearch("enviar") && (
                    <li>
                      <Link to="/mensajeria/enviar" className="submenu-link">
                        <FiSend className="nav-icon" />
                        <span>Enviar</span>
                      </Link>
                    </li>
                  )}
                  {matchesSearch("programar") && (
                    <li>
                      <Link to="/mensajeria/programar" className="submenu-link">
                        <FiClock className="nav-icon" />
                        <span>Programar</span>
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}

          {/* PLANTILLAS */}
          {(matchesSearch("plantilla") || matchesSearch("crear") || matchesSearch("administrar")) && (
            <li className="nav-item-has-submenu">
              <div
                className="nav-link submenu-toggle"
                onClick={() => setOpenPlantillas(!openPlantillas)}
              >
                <FiFileText className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span>Plantillas</span>
                    {openPlantillas ? <FiChevronUp className="arrow-submenu" /> : <FiChevronDown className="arrow-submenu" />}
                  </>
                )}
              </div>
              {openPlantillas && !isCollapsed && (
                <ul className="submenu">
                  {matchesSearch("crear") && (
                    <li>
                      <Link to="/crear-plantillas" className="submenu-link">
                        <FiPlusCircle className="nav-icon" />
                        <span>Crear plantilla</span>
                      </Link>
                    </li>
                  )}
                  {matchesSearch("administrar") && (
                    <li>
                      <Link to="/administrar-plantillas" className="submenu-link">
                        <FiEdit3 className="nav-icon" />
                        <span>Administrar plantillas</span>
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}

          {matchesSearch("calendario") && (
            <li>
              <Link to="/calendario" className="nav-link">
                <FiCalendar className="nav-icon" />
                {!isCollapsed && <span>Calendario</span>}
              </Link>
            </li>
          )}
        </ul>

        {/* SETTINGS */}
        {!isCollapsed && <p className="nav-title">SETTINGS</p>}
        <ul className="nav-list">
          {matchesSearch("configuracion") && (
            <li>
              <Link to="/configuracion" className="nav-link">
                <FiSettings className="nav-icon" />
                {!isCollapsed && <span>Configuración</span>}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* FOOTER FIJO */}
      <div className="sidebar__footer">
        <Link to="/login" className="logout-link">
          <FiLogOut className="nav-icon" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
