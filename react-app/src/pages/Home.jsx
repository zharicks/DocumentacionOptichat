import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

// Importamos nuestra imagen de banner y los estilos SCSS
import bannerImage from "../assets/bannerHome.png";
import "../styles/home.scss";

// Datos de ejemplo para las tarjetas de resumen
const unreadMessages = 120;
const totalSent = 4578;
const nextScheduledDate = "15 de Marzo 2025";

// Últimas campañas (realizadas) con datos “enviados” y “leídos”
const lastCampaigns = [
  {
    id: 1,
    title: "Campaña de Invierno",
    status: "En progreso",
    sent: 3000,
    read: 2400,
  },
  {
    id: 2,
    title: "Campaña de Primavera",
    status: "Finalizada",
    sent: 4200,
    read: 3600,
  },
  {
    id: 3,
    title: "Campaña de Verano",
    status: "Finalizada",
    sent: 5000,
    read: 4100,
  },
];

// Subcomponente para la mini-card de campañas
function MiniCampaignCard({ title, status, sent, read }) {
  const readPercent = Math.round((read / sent) * 100);

  const data = {
    labels: [""],
    datasets: [
      { label: "Enviados", data: [sent], backgroundColor: "#60A5FA" },
      { label: "Leídos", data: [read], backgroundColor: "#1D4ED8" },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  return (
    <div className="mini-campaign-card">
      <div className="mini-campaign-info">
        <h4 className="mini-campaign-title">{title}</h4>
        <p className="mini-campaign-status">{status}</p>
        <p className="mini-campaign-value">
          {`Enviados: ${sent}`} <br />
          {`Leídos: ${read} (${readPercent}%)`}
        </p>
      </div>
      <div className="mini-campaign-chart">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

MiniCampaignCard.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  sent: PropTypes.number.isRequired,
  read: PropTypes.number.isRequired,
};

export default function Home() {
  return (
    <div className="home-page">
      {/* Banner con imagen */}
      <div
        className="home-banner"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <h1 className="banner-title">¡Bienvenido a Optichat!</h1>
        <p className="banner-subtitle">
          Gestiona tus campañas y alcanza más clientes de manera eficiente
        </p>
      </div>

      {/* Cards de resumen (agrandados) */}
      <section className="home-summary">
        <div className="summary-card">
          <h3 className="card-title">Mensajes sin leer</h3>
          <p className="card-value">{unreadMessages}</p>
        </div>
        <div className="summary-card">
          <h3 className="card-title">Mensajes enviados</h3>
          <p className="card-value">{totalSent}</p>
        </div>
        <div className="summary-card">
          <h3 className="card-title">Próximo envío programado</h3>
          <p className="card-value next-send-date">{nextScheduledDate}</p>
        </div>
      </section>

      {/* Últimas campañas con mini-gráficas */}
      <section className="last-campaigns-section">
        <h2 className="section-title">Últimas Campañas</h2>
        <div className="mini-cards-container">
          {lastCampaigns.map((camp) => (
            <MiniCampaignCard
              key={camp.id}
              title={camp.title}
              status={camp.status}
              sent={camp.sent}
              read={camp.read}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
