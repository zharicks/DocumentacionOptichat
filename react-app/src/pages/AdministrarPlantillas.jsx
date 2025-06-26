import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "../styles/administrarPlantillas.scss";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);

const centerTextPlugin = {
  id: "centerTextPlugin",
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    const text = chart.config.data.centerText || "";
    ctx.save();
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  },
};

export default function AdministrarPlantillas() {
  const navigate = useNavigate();
  const [plantillasData, setPlantillasData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [minLectura, setMinLectura] = useState(0);

  useEffect(() => {
    const rawEmpresa = localStorage.getItem("empresaData");
    const empresa_id = rawEmpresa ? JSON.parse(rawEmpresa)._id : null;
    if (!empresa_id) return;

    axios
      .get(`http://127.0.0.1:8000/plantillas-meta/?empresa_id=${empresa_id}`)
      .then((res) => {
        const raw = res.data.plantillas;
        const transformadas = raw.map((p, i) => ({
          id: i + 1,
          nombre: p.name || "Sin nombre",
          categoria: (p.category || "Marketing").toLowerCase(),
          idioma: (p.language || "es").toLowerCase(),
          estado:
            p.status === "APPROVED"
              ? "Aprobada"
              : p.status === "REJECTED"
              ? "Rechazada"
              : "En revisión",
          enviados: p.total_messages_sent || 0,
          indiceLectura:
            p.total_messages_sent > 0
              ? Math.round(
                  (p.total_messages_opened / p.total_messages_sent) * 100
                )
              : 0,
        }));
        setPlantillasData(transformadas);
      })
      .catch((err) => console.error(err));
  }, []);

  const getFilteredData = () => {
    return plantillasData.filter((p) => {
      if (searchText && !p.nombre.toLowerCase().includes(searchText.toLowerCase()))
        return false;
      if (categoria && p.categoria !== categoria.toLowerCase()) return false;
      if (idioma && p.idioma !== idioma.toLowerCase()) return false;
      if (p.indiceLectura < minLectura) return false;
      return true;
    });
  };

  const data = getFilteredData();
  const totalIndice = data.reduce((acc, p) => acc + p.indiceLectura, 0);
  const promedioLectura = data.length > 0 ? Math.round(totalIndice / data.length) : 0;

  const ringData = {
    labels: ["Índice lectura", "Restante"],
    centerText: `${promedioLectura}%`,
    datasets: [
      {
        data: [promedioLectura, 100 - promedioLectura],
        backgroundColor: ["#3B82F6", "#E5E7EB"],
        cutout: "70%",
      },
    ],
  };

  const barData = {
    labels: ["Lectura Total"],
    datasets: [
      {
        label: "Lectura",
        data: [promedioLectura],
        backgroundColor: "#1D4ED8",
      },
    ],
  };

  const horizontalData = {
    labels: ["Rechazadas", "Aprobadas", "En revisión"],
    datasets: [
      {
        data: [
          data.filter((p) => p.estado === "Rechazada").length,
          data.filter((p) => p.estado === "Aprobada").length,
          data.filter((p) => p.estado === "En revisión").length,
        ],
        backgroundColor: ["#93C5FD", "#3B82F6", "#1D4ED8"],
      },
    ],
  };

  const optionsShared = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  const getEstadoClass = (estado) => {
    const lower = estado.toLowerCase();
    if (lower.includes("rechazada")) return "badge-rechazada";
    if (lower.includes("aprobada")) return "badge-aprobada";
    if (lower.includes("en revisión")) return "badge-revision";
    return "badge-default";
  };

  return (
    <div className="admin-plantillas-page">
      <h2 className="page-title">Administrador de plantillas</h2>

      {/* Cards y gráficas */}
      <div className="summary-and-graphs">
        <div className="cards-grid">
          <div className="card-item"><p className="card-value">{data.length}</p><p className="card-label">Plantillas totales</p></div>
          <div className="card-item"><p className="card-value">{data.filter(p => p.estado === "Aprobada").length}</p><p className="card-label">Aprobadas</p></div>
          <div className="card-item"><p className="card-value">{data.filter(p => p.estado === "Rechazada").length}</p><p className="card-label">Rechazadas</p></div>
          <div className="card-item"><p className="card-value">{data.filter(p => p.estado === "En revisión").length}</p><p className="card-label">En revisión</p></div>
        </div>

        <div className="multi-graphs-card">
          <div className="graphs-row">
            <div className="graph-block ring-graph"><p className="graph-title">Índice de Lectura</p><Doughnut data={ringData} options={optionsShared} plugins={[centerTextPlugin]} /></div>
            <div className="graph-block bar-vertical"><p className="graph-title">Lectura Total</p><Bar data={barData} options={optionsShared} /></div>
            <div className="graph-block bar-horizontal"><p className="graph-title">Distribución de Estados</p><Bar data={horizontalData} options={{ ...optionsShared, indexAxis: "y" }} /></div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <section className="plantillas-filters">
        <input type="text" placeholder="Buscar" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="filter-search" />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="filter-dropdown">
          <option value="">Categoría</option>
          <option value="marketing">Marketing</option>
          <option value="utilidad">Utilidad</option>
        </select>
        <select value={idioma} onChange={(e) => setIdioma(e.target.value)} className="filter-dropdown">
          <option value="">Idioma</option>
          <option value="es">Spanish</option>
          <option value="en">English</option>
        </select>

        <div className="custom-slider-container">
          <label className="slider-label">Índice de lectura mínimo: {minLectura}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="25"
            value={minLectura}
            onChange={(e) => setMinLectura(Number(e.target.value))}
            className="custom-slider"
          />
          <div className="slider-ticks">
            {[0, 25, 50, 75, 100].map((val) => (
              <span key={val}>{val}%</span>
            ))}
          </div>
        </div>

        <button className="crear-button" onClick={() => navigate("/crear-plantillas")}>Crear plantilla</button>
      </section>

      {/* Tabla */}
      <section className="plantillas-table-section">
        <table className="plantillas-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Categoría</th><th>Idioma</th><th>Estado</th><th>Enviados</th><th>Índice de lectura</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.idioma}</td>
                <td><span className={`badge-estado ${getEstadoClass(p.estado)}`}>{p.estado}</span></td>
                <td>{p.enviados}</td>
                <td>{p.indiceLectura}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
