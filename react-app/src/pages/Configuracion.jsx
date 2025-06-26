import { useEffect, useState } from "react";
import "../styles/configuracion.scss";

const Configuracion = () => {
  const [empresa, setEmpresa] = useState(null);
  const [meta, setMeta] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const emp = JSON.parse(localStorage.getItem("empresaData"));
    const met = JSON.parse(localStorage.getItem("configuracion_meta"));
    const usr = JSON.parse(localStorage.getItem("usuario_data"));

    if (emp && met && usr) {
      setEmpresa(emp);
      setMeta(met);
      setUsuario(usr);
    }
  }, []);

  if (!empresa || !meta || !usuario) {
    return <p className="loading">Cargando información...</p>;
  }

  return (
    <div className="formulario-calendario">
      <div className="form-section">
        <h2 className="section-title">Información Personal</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre completo</label>
            <input type="text" value={usuario.nombre_completo} disabled />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" value={usuario.telefono} disabled />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="text" value={usuario.correo} disabled />
          </div>
          <div className="form-group">
            <label>Cargo</label>
            <input type="text" value={usuario.cargo} disabled />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-title">Información de la Empresa</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre de la empresa</label>
            <input type="text" value={empresa.nombre} disabled />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" value={empresa.telefono} disabled />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input type="text" value={empresa.correo} disabled />
          </div>
          <div className="form-group">
            <label>Página web</label>
            <input type="text" value={empresa.pagina_web} disabled />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input type="text" value={empresa.direccion} disabled />
          </div>
          <div className="form-group">
            <label>Ciudad</label>
            <input type="text" value={empresa.ciudad} disabled />
          </div>
          <div className="form-group">
            <label>Departamento</label>
            <input type="text" value={empresa.departamento} disabled />
          </div>
          <div className="form-group">
            <label>País</label>
            <input type="text" value={empresa.pais} disabled />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-title">Información Técnica Meta</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Identificador de la aplicación</label>
            <input type="text" value={meta.id_aplicacion} disabled />
          </div>
          <div className="form-group">
            <label>Token de acceso</label>
            <input type="text" value={meta.token_acceso} disabled />
          </div>
          <div className="form-group">
            <label>Número de teléfono</label>
            <input type="text" value={meta.numero_telefono} disabled />
          </div>
          <div className="form-group">
            <label>ID de número de teléfono</label>
            <input type="text" value={meta.id_numero_telefono} disabled />
          </div>
          <div className="form-group">
            <label>ID de cuenta WABA</label>
            <input type="text" value={meta.id_cuenta_waba} disabled />
          </div>
          <div className="form-group">
            <label>URL de mensajes</label>
            <input type="text" value={meta.url_mensajes} disabled />
          </div>
          <div className="form-group">
            <label>URL de plantillas</label>
            <input type="text" value={meta.url_plantillas} disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
