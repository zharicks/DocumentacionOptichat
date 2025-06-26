import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import "../styles/enviarMensajeria.scss";

export default function EnviarMensajeria() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [headerImageFile, setHeaderImageFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [fileContacts, setFileContacts] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const [showProgress, setShowProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [sendComplete, setSendComplete] = useState(false);

  const empresa = JSON.parse(localStorage.getItem("empresaData"));
  const configMeta = JSON.parse(localStorage.getItem("configMeta")) || {};

  useEffect(() => {
    if (empresa?._id) {
      axios
        .get(`http://localhost:8000/plantillas-meta/?empresa_id=${empresa._id}`)
        .then((res) => {
          setTemplates(res.data.plantillas);
        })
        .catch((err) => console.error("Error obteniendo plantillas:", err));
    }
  }, [empresa]);

  const templateData = templates.find((tpl) => tpl.name === selectedTemplate) || null;

  const handleLocalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setHeaderImageFile(file);
  };
  const handleRemoveLocalImage = () => setHeaderImageFile(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileContacts(file);
    setShowUploadModal(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);
      setContacts(parsed);
    };
    reader.readAsBinaryString(file);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus("success");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRemoveFile = () => {
    setFileContacts(null);
    setContacts([]);
  };
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  const handleSendMassive = async () => {
    if (!templateData || contacts.length === 0) return;
    setShowProgress(true);
    setProgressValue(0);
    setSendComplete(false);

    const formData = new FormData();
    formData.append("template_name", templateData.name);
    formData.append("language", templateData.language);
    formData.append("phone_number_id", configMeta.id_numero);
    formData.append("token", configMeta.token_acceso);
    formData.append("url_envio", configMeta.url_mensajes);
    formData.append("campaign_name", campaignName);
    formData.append("file", fileContacts);
    if (headerImageFile) {
      formData.append("image", headerImageFile);
    }

    try {
      await axios.post("http://localhost:8000/enviar-mensajes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total;
          const current = progressEvent.loaded;
          const percent = Math.round((current / total) * 100);
          setProgressValue(percent);
        },
      });
      setSendComplete(true);
    } catch (error) {
      alert("Error enviando mensajes.");
      console.error(error);
    }
  };

  const closeSendComplete = () => {
    setSendComplete(false);
    setShowProgress(false);
    setProgressValue(0);
  };

  const previewImageUrl = headerImageFile ? URL.createObjectURL(headerImageFile) : null;

  return (
    <div className="enviar-mensajeria-page">
      <div className="schedule-button-container">
        <button className="schedule-button" onClick={() => alert("Agendar envío")}>
          Agendar envío masivo
        </button>
      </div>

      <h2 className="page-title">Enviar Mensajería Masiva</h2>

      <div className="content-wrapper">
        <div className="form-area">
          {/* Plantilla */}
          <div className="form-card">
            <h3 className="section-title">Seleccionar plantilla</h3>
            <div className="field-group">
              <label>Plantilla disponible</label>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                <option value="">-- Selecciona --</option>
                {templates.map((tpl, i) => (
                  <option key={i} value={tpl.name}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaña */}
          <div className="form-card">
            <h3 className="section-title">Datos de la campaña</h3>
            <div className="field-group">
              <label>Nombre de la campaña</label>
              <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>
          </div>

          {/* Imagen */}
          <div className="form-card">
            <h3 className="section-title">Encabezado (Imagen - opcional)</h3>
            <div className="field-group custom-upload">
              <label>Subir imagen</label>
              <div className="custom-upload-container">
                <label htmlFor="localHeaderImage" className="custom-upload-btn">
                  {headerImageFile ? headerImageFile.name : "Seleccionar archivo"}
                </label>
                <input id="localHeaderImage" type="file" accept="image/*" onChange={handleLocalImageUpload} />
                {headerImageFile && <button className="remove-image-btn" onClick={handleRemoveLocalImage}>X</button>}
              </div>
            </div>
          </div>

          {/* Excel */}
          <div className="form-card">
            <h3 className="section-title">Subir base de datos</h3>
            <div className="guide-box">
              El archivo debe tener columnas: <strong>Nombre</strong> y <strong>Celular</strong>.
            </div>
            <div className="dropzone">
              {fileContacts ? (
                <div className="file-info">
                  <p>{fileContacts.name}</p>
                  <button className="remove-file-btn" onClick={handleRemoveFile}>X</button>
                </div>
              ) : (
                <label htmlFor="contactsFile" className="dropzone-label">
                  <p className="dropzone-title">Subir archivo</p>
                  <p className="dropzone-subtitle">Haz clic o arrastra</p>
                </label>
              )}
              <input id="contactsFile" type="file" onChange={handleFileUpload} style={{ display: "none" }} />
            </div>
          </div>

          {/* Enviar */}
          <div className="action-row">
            <button className="submit-send" onClick={handleSendMassive}>
              Enviar mensajería masiva
            </button>
          </div>

          {showProgress && (
            <div className="progress-bar-container">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressValue}%` }} /></div>
              <p>{progressValue}% enviados</p>
            </div>
          )}
        </div>

        {/* Vista previa */}
        <div className="preview-area">
          <div className="preview-card">
            <h3 className="preview-title">Vista previa</h3>
            <div className="massive-preview">
              <div className="preview-header"><h4>{campaignName || "Nombre de campaña"}</h4></div>
              <div className="header-image-container">
                {headerImageFile ? <img src={previewImageUrl} className="header-image" /> : <div className="header-image placeholder" />}
              </div>
              {templateData ? (
                <>
                  <p className="template-body">{templateData.components?.find(c => c.type === "BODY")?.text || "Sin texto"}</p>
                  <p className="template-footer">{templateData.components?.find(c => c.type === "FOOTER")?.text}</p>
                </>
              ) : (
                <p>No se ha seleccionado plantilla</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de carga archivo */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className={`modal-content upload-${uploadStatus}`}>
            <h2 className="modal-title">{uploadStatus === "success" ? "Archivo subido correctamente" : "Subiendo archivo"}</h2>
            <div className="upload-bar"><div className="upload-fill" style={{ width: `${uploadProgress}%` }} /></div>
            <p>{uploadProgress}%</p>
            {uploadStatus === "success" && <button onClick={closeUploadModal}>Cerrar</button>}
          </div>
        </div>
      )}

      {/* Modal de envío exitoso */}
      {sendComplete && (
        <div className="modal-backdrop">
          <div className="modal-content success-final">
            <div className="modal-icon success-icon">&#10004;</div>
            <h2 className="modal-title">Campaña enviada exitosamente</h2>
            <p className="modal-subtitle">Tus mensajes se han enviado a todos los destinatarios.</p>
            <button onClick={closeSendComplete}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
