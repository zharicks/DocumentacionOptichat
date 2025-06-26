import { useState } from "react";
import "../styles/programarMensajeria.scss";

export default function ProgramarMensajeria() {
  // Fecha y hora
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Resto de estados
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [headerImageFile, setHeaderImageFile] = useState(null);

  // Archivo + pop-up de subida
  const [fileContacts, setFileContacts] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle"); 
  // "idle", "uploading", "success", "error"

  // Exito final al programar
  const [programSuccess, setProgramSuccess] = useState(false);

  // Plantillas de ejemplo
  const templates = [
    {
      id: "tpl1",
      name: "Promoción 2x1",
      body: "Hola, {{1}}. Disfruta nuestras promociones.",
      footer: "Servicio Optichat",
      buttons: ["Ver oferta", "Más info"],
    },
    {
      id: "tpl2",
      name: "Recordatorio de Cita",
      body: "Estimado {{1}}, le recordamos su cita mañana.",
      footer: "Tu óptica de confianza",
      buttons: ["Reprogramar", "Cancelar"],
    },
    {
      id: "tpl3",
      name: "Ofertas de Verano",
      body: "¡Hola {{1}}! No te pierdas nuestras ofertas de verano.",
      footer: "Optichat Summer",
      buttons: ["Ver catálogo"],
    },
  ];
  const templateData = templates.find((tpl) => tpl.id === selectedTemplate) || null;

  // Subir imagen => vista previa
  const handleLocalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setHeaderImageFile(file);
  };
  const handleRemoveLocalImage = () => setHeaderImageFile(null);

  // Subir base de datos => abrimos pop-up
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileContacts(file);
      setShowUploadModal(true);
      setUploadStatus("uploading");
      setUploadProgress(0);

      // simulamos subida
      let interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus("success");
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };
  const handleRemoveFile = () => setFileContacts(null);

  // Cerrar modal de subida
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadProgress(0);
    setUploadStatus("idle");
  };

  // Vista previa de la imagen
  const previewImageUrl = headerImageFile
    ? URL.createObjectURL(headerImageFile)
    : null;

  // Validar fecha/hora futuro
  const handleProgram = () => {
    const chosenDateTime = new Date(`${scheduleDate} ${scheduleTime}`);
    const now = new Date();
    if (!scheduleDate || !scheduleTime || isNaN(chosenDateTime.getTime())) {
      alert("Por favor selecciona fecha y hora válidas.");
      return;
    }
    if (chosenDateTime <= now) {
      alert("La fecha/hora debe ser posterior al momento actual.");
      return;
    }
    // Exito
    setProgramSuccess(true);
  };
  const closeProgramSuccess = () => {
    setProgramSuccess(false);
  };

  return (
    <div className="programar-mensajeria-page">
      <h2 className="page-title">Programar Mensajería Masiva</h2>

      <div className="content-wrapper">
        {/* IZQUIERDA */}
        <div className="form-area">
          {/* Seleccionar fecha/hora */}
          <div className="form-card">
            <h3 className="section-title">Seleccionar fecha y hora</h3>
            <p className="section-subtitle">
              Elige un día y hora futuros para enviar tu campaña.
            </p>
            <div className="field-group">
              <label>Fecha</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Hora</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          {/* Plantilla */}
          <div className="form-card">
            <h3 className="section-title">Seleccionar plantilla</h3>
            <div className="field-group">
              <label>Plantilla disponible</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">-- Selecciona --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos campaña */}
          <div className="form-card">
            <h3 className="section-title">Datos de la campaña</h3>
            <div className="field-group">
              <label>Nombre de la campaña</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ej: Campaña de invierno"
              />
            </div>
          </div>

          {/* Encabezado imagen */}
          <div className="form-card">
            <h3 className="section-title">Encabezado (Imagen - opcional)</h3>
            <div className="field-group custom-upload">
              <label>Subir imagen</label>
              <div className="custom-upload-container">
                <label htmlFor="headerImage" className="custom-upload-btn">
                  {headerImageFile ? headerImageFile.name : "Seleccionar archivo"}
                </label>
                <input
                  id="headerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleLocalImageUpload}
                />
                {headerImageFile && (
                  <button className="remove-image-btn" onClick={handleRemoveLocalImage}>
                    X
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subir base de datos */}
          <div className="form-card">
            <h3 className="section-title">Subir base de datos</h3>
            <p className="section-subtitle">
              Tu archivo debe contener columnas “Nombre” y “Celular” con el código país.
            </p>
            <div className="dropzone">
              {fileContacts ? (
                <div className="file-info">
                  <p>{fileContacts.name}</p>
                  <button className="remove-file-btn" onClick={handleRemoveFile}>
                    X
                  </button>
                </div>
              ) : (
                <label htmlFor="contactsFile" className="dropzone-label">
                  <div className="dropzone-icon">&#8682;</div>
                  <p className="dropzone-title">Subir archivo</p>
                  <p className="dropzone-subtitle">
                    Haz clic para explorar o arrastra un archivo aquí
                  </p>
                </label>
              )}
              <input
                id="contactsFile"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Botón Programar */}
          <div className="action-row">
            <button className="submit-program" onClick={handleProgram}>
              Programar
            </button>
          </div>
        </div>

        {/* DERECHA: Vista previa + mini calendario */}
        <div className="preview-area">
          <div className="preview-card">
            <h3 className="preview-title">Vista previa de la plantilla</h3>
            <div className="program-preview">
              <h4>{campaignName || "Nombre de campaña"}</h4>
              <div className="header-image-container">
                {headerImageFile ? (
                  <img
                    src={previewImageUrl}
                    alt="header"
                    className="header-image"
                  />
                ) : (
                  <div className="header-image placeholder" />
                )}
              </div>
              {templateData ? (
                <>
                  <p className="template-body">{templateData.body}</p>
                  <p className="template-footer">{templateData.footer}</p>
                  <div className="buttons-container">
                    {templateData.buttons.map((btn, i) => (
                      <button key={i} className="btn-whatsapp">
                        {btn}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>No se ha seleccionado plantilla</p>
              )}
            </div>
          </div>

          {/* Mini calendario */}
          <div className="mini-calendar-card">
            <h3 className="mini-calendar-title">Calendario</h3>
            <div className="mini-calendar-container">
              <table className="mini-calendar-table">
                <thead>
                  <tr><th colSpan="7">Marzo 2025</th></tr>
                  <tr><th>Do</th><th>Lu</th><th>Ma</th><th>Mi</th><th>Ju</th><th>Vi</th><th>Sa</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="day inactive">1</td>
                    <td className="day inactive">2</td>
                    <td className="day">3</td>
                    <td className="day">4</td>
                    <td className="day">5</td>
                    <td className="day">6</td>
                    <td className="day">7</td>
                  </tr>
                  <tr>
                    <td className="day">8</td>
                    <td className="day selected">9</td>
                    <td className="day">10</td>
                    <td className="day">11</td>
                    <td className="day">12</td>
                    <td className="day">13</td>
                    <td className="day">14</td>
                  </tr>
                  {/* Y así sucesivamente */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de subida de archivo */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className={`modal-content upload-${uploadStatus}`}>
            {uploadStatus === "uploading" && (
              <>
                <h2 className="modal-title">Subiendo archivo</h2>
                <div className="modal-icon uploading-icon">&#128190;</div>
                <p className="modal-subtitle">Por favor espera mientras subimos el archivo.</p>
                <div className="upload-bar">
                  <div
                    className="upload-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p>{uploadProgress}%</p>
              </>
            )}
            {uploadStatus === "success" && (
              <>
                <div className="modal-icon success-icon">&#10004;</div>
                <h2 className="modal-title">Archivo subido correctamente</h2>
                <p className="modal-subtitle">
                  Se procesará la información de los clientes.
                </p>
                <button onClick={closeUploadModal}>Cerrar</button>
              </>
            )}
            {uploadStatus === "error" && (
              <>
                <div className="modal-icon error-icon">&#10006;</div>
                <h2 className="modal-title">Error al subir el archivo</h2>
                <p className="modal-subtitle">
                  Por favor verifica el formato e inténtalo de nuevo.
                </p>
                <button onClick={closeUploadModal}>Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de éxito al programar */}
      {programSuccess && (
        <div className="modal-backdrop">
          <div className="modal-content success-final">
            <div className="modal-icon success-icon">&#10004;</div>
            <h2 className="modal-title">Envío programado</h2>
            <p className="modal-subtitle">
              Tu campaña se enviará en la fecha y hora seleccionadas.
            </p>
            <button onClick={closeProgramSuccess}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
