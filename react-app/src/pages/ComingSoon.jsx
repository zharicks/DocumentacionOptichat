import "../styles/comingSoon.scss";
import { FiSettings, FiAlertCircle } from "react-icons/fi";

export default function ComingSoon() {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-card">
        <div className="icon-wrapper">
          <FiSettings className="animated-icon" />
        </div>
        <div className="text-content">
          <h1 className="title">¡Funcionalidad en desarrollo!</h1>
          <p className="subtitle">
            Estamos trabajando para brindarte una experiencia aún más poderosa.
            <br />
            Esta sección estará disponible muy pronto.
          </p>
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="tagline">
            <FiAlertCircle className="tag-icon" />
            <span>Gracias por tu paciencia ✨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
