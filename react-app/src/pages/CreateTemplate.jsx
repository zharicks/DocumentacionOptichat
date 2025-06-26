import { useState } from "react";
import "../styles/createTemplate.scss";

export default function CreateTemplate() {
  // Estados
  const [templateName, setTemplateName] = useState("");
  const [headerImage, setHeaderImage] = useState(null);
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState([]);

  const language = "English"; // Fijo

  // Subir imagen
  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderImage(file);
    }
  };

  // Quitar la imagen
  const handleRemoveImage = () => {
    setHeaderImage(null);
  };

  // Añadir un botón vacío
  const handleAddButton = () => {
    setButtons([...buttons, { text: "", url: "" }]);
  };

  // Manejo de texto/URL en botones
  const handleButtonChange = (index, field, value) => {
    const newBtns = [...buttons];
    newBtns[index][field] = value;
    setButtons(newBtns);
  };

  // Eliminar un botón
  const handleRemoveButton = (index) => {
    const newBtns = [...buttons];
    newBtns.splice(index, 1);
    setButtons(newBtns);
  };

  // Vista previa de la imagen
  const previewImageURL = headerImage ? URL.createObjectURL(headerImage) : null;

  // Respetar saltos de línea en la vista previa
  const getBodyPreview = () => {
    if (bodyText.trim() === "") {
      return ["Este es un mensaje de prueba de Optichat."];
    }
    return bodyText.split("\n").map((line) => line || " ");
  };

  // "Enviar para revisión" (placeholder)
  const handleSubmitReview = () => {
    alert("Plantilla enviada a revisión (placeholder)!");
  };

  return (
    <div className="create-template-page">
      {/* Wizard de 3 pasos */}
      <div className="steps-header">
        {/* 1. Configurar (hecho) */}
        <div className="step-item done">
          <div className="circle-check">
            <span className="checkmark">&#10003;</span>
          </div>
          <span>1. Configurar plantilla</span>
        </div>
        {/* 2. Editar (activo) */}
        <div className="step-item active">
          <div className="circle-active" />
          <span>2. Editar plantilla</span>
        </div>
        {/* 3. Enviar para revisión (futuro) */}
        <div className="step-item future">
          <div className="circle-future" />
          <span>3. Enviar para revisión</span>
        </div>
      </div>

      <h2 className="page-title">Crear plantilla</h2>

      <div className="content-wrapper">
        {/* FORMULARIO IZQUIERDA */}
        <div className="form-area">
          {/* Card: Nombre e idioma */}
          <div className="form-card">
            <h3 className="section-title">Nombre e idioma</h3>
            <div className="field-group">
              <label>Nombre de la plantilla</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: mi_plantilla_promocion"
              />
            </div>
            <div className="field-group">
              <label>Idioma</label>
              <input
                type="text"
                value={language}
                disabled
              />
            </div>
          </div>

          {/* Card: Encabezado (imagen) */}
          <div className="form-card">
            <h3 className="section-title">Encabezado (Imagen)</h3>
            <div className="field-group custom-upload">
              <label>Subir imagen</label>
              <div className="custom-upload-container">
                <label htmlFor="headerImage" className="custom-upload-btn">
                  {headerImage ? headerImage.name : "Seleccionar archivo"}
                </label>
                <input
                  id="headerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                />
                {headerImage && (
                  <button className="remove-image-btn" onClick={handleRemoveImage}>
                    X
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card: Contenido (cuerpo + footer + variable) */}
          <div className="form-card">
            <h3 className="section-title">Contenido</h3>

            {/* Info de variable */}
            <div className="variable-info">
              <p>
                <strong>Personalización: </strong> Para usarla en tu mensaje, emplea <code>{"{{1}}"}</code> donde se reemplazará una variable, como por ejemplo el nombre de tu cliente.
              </p>
            </div>

            <div className="field-group">
              <label>Cuerpo del mensaje</label>
              <textarea
                rows={4}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Ej: Hola, {{1}}. Este es un mensaje de Optichat..."
              />
            </div>
            <div className="field-group">
              <label>Pie de página</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="Ej: Servicio Optichat"
              />
            </div>
          </div>

          {/* Card: Botones opcionales */}
          <div className="form-card">
            <h3 className="section-title">Botones (opcional)</h3>
            {/* Cada botón => text + url + X */}
            {buttons.map((btn, idx) => (
              <div className="buttons-row" key={idx}>
                <input
                  type="text"
                  className="button-text"
                  value={btn.text}
                  onChange={(e) => handleButtonChange(idx, "text", e.target.value)}
                  placeholder="Texto del botón"
                />
                <input
                  type="text"
                  className="button-url"
                  value={btn.url}
                  onChange={(e) => handleButtonChange(idx, "url", e.target.value)}
                  placeholder="https://example.com"
                />
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveButton(idx)}
                >
                  X
                </button>
              </div>
            ))}
            <button className="add-button-btn" onClick={handleAddButton}>
              Agregar botón
            </button>
          </div>

          {/* Botón final => enviar para revisión */}
          <div className="action-row">
            <button className="submit-review" onClick={handleSubmitReview}>
              Enviar para revisión
            </button>
          </div>
        </div>

        {/* VISTA PREVIA DERECHA */}
        <div className="preview-area">
          <div className="preview-card">
            <h3 className="preview-title">Vista previa de la plantilla</h3>
            <div className="whatsapp-preview">
              {/* Imagen encabezado */}
              <div className="header-image-container">
                {previewImageURL ? (
                  <img src={previewImageURL} alt="preview" className="header-image" />
                ) : (
                  <div className="header-image placeholder" />
                )}
              </div>

              {/* Cuerpo (respetar saltos de línea) */}
              <div className="body-preview">
                {getBodyPreview().map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* Pie de página */}
              {footerText.trim() !== "" && (
                <div className="footer-preview">
                  {footerText}
                </div>
              )}

              {/* Botones */}
              {buttons.length > 0 && (
                <div className="buttons-preview">
                  {buttons.map((btn, i) => (
                    <button key={i} className="btn-whatsapp">
                      {btn.text || "Botón"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
