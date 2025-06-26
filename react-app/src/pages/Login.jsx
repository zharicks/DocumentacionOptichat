import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.scss";
import logo from "../assets/optichat-icon.png";
import bg from "../assets/Background.png";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verificadoMeta, setVerificadoMeta] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!verificadoMeta) {
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();

      localStorage.setItem("usuario_id", data.usuario._id);
      localStorage.setItem("usuario_data", JSON.stringify(data.usuario));
      localStorage.setItem("empresaData", JSON.stringify(data.empresa));
      localStorage.setItem("configuracion_meta", JSON.stringify(data.configuracion_meta));

      navigate("/inicio");
    } catch (error) {
      setErrorLogin(error.message);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2 className="login-title">¡Bienvenido de nuevo!</h2>
        <p className="login-subtitle">Inicia sesión para continuar en tu cuenta</p>

        {showAlert && (
          <div className="login-alert">Debes estar verificado en Meta para iniciar sesión.</div>
        )}
        {errorLogin && (
          <div className="login-alert">{errorLogin}</div>
        )}

        <label className="login-label">Usuario</label>
        <input
          className="login-input"
          type="text"
          placeholder="Ingresa tu usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <label className="login-label">Contraseña</label>
        <input
          className="login-input"
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="login-checkbox">
          <input
            type="checkbox"
            checked={verificadoMeta}
            onChange={(e) => setVerificadoMeta(e.target.checked)}
          />
          <span>Ya estoy verificado en Meta</span>
        </div>

        <button className="login-button" onClick={handleLogin}>
          Iniciar sesión
        </button>

        <p className="login-footer">
          ¿Aún no tienes cuenta?{" "}
          <a href="https://optichat.co/planes-1" target="_blank" rel="noreferrer">
            Conoce los planes
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
