import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendarioMensajeria.scss";

const localizer = momentLocalizer(moment);

export default function CalendarioMensajeria() {
  const [events, setEvents] = useState([
    {
      title: "Campaña Lentes Promo",
      start: new Date(2025, 2, 21, 11, 0),
      end: new Date(2025, 2, 21, 12, 0),
      templateId: "tpl1",
    },
  ]);

  const templates = [
    {
      id: "tpl1",
      name: "Promoción 2x1",
      body: "Hola, {{1}}. Disfruta nuestras promociones.",
      footer: "Servicio Optichat",
    },
    {
      id: "tpl2",
      name: "Recordatorio de Cita",
      body: "Estimado {{1}}, le recordamos su cita mañana.",
      footer: "Tu óptica de confianza",
    },
  ];

  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventData, setNewEventData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsCreating(false);
    setShowPopup(true);
  };

  const handleSelectSlot = (slotInfo) => {
    const selectedDate = slotInfo.start;
    setNewEventData({
      title: "",
      start: selectedDate,
      end: moment(selectedDate).add(1, "hour").toDate(),
      templateId: "",
    });
    setIsCreating(true);
    setShowPopup(true);
  };

  const handleInputChange = (field, value) => {
    setNewEventData({ ...newEventData, [field]: value });
  };

  const handleCreateEvent = () => {
    if (!newEventData.title || !newEventData.templateId) {
      alert("Completa el nombre de campaña y plantilla");
      return;
    }
    setEvents([...events, newEventData]);
    setShowPopup(false);
  };

  const getTemplate = (id) => templates.find((tpl) => tpl.id === id);

  return (
    <div className="calendario-mensajeria-page">
      <h2 className="page-title">Calendario de Mensajería Masiva</h2>
      <div className="big-calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          style={{ height: 500 }}
          popup
          views={["month", "week", "day", "agenda"]}
          messages={{
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            today: "Hoy",
            previous: "Atrás",
            next: "Siguiente",
          }}
        />
      </div>

      {showPopup && (
        <div className="modal-backdrop">
          <div className="modal-content schedule-popup">
            {isCreating ? (
              <>
                <h2 className="modal-title">
                  Agendar campaña para {moment(newEventData.start).format("YYYY-MM-DD")}
                </h2>
                <label>Hora</label>
                <input
                  type="time"
                  value={moment(newEventData.start).format("HH:mm")}
                  onChange={(e) => {
                    const newStart = moment(newEventData.start)
                      .set({
                        hour: e.target.value.split(":")[0],
                        minute: e.target.value.split(":")[1],
                      })
                      .toDate();
                    const newEnd = moment(newStart).add(1, "hour").toDate();
                    setNewEventData({ ...newEventData, start: newStart, end: newEnd });
                  }}
                />

                <label>Nombre de la campaña</label>
                <input
                  type="text"
                  value={newEventData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />

                <label>Plantilla</label>
                <select
                  value={newEventData.templateId}
                  onChange={(e) => handleInputChange("templateId", e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>

                <div className="popup-buttons">
                  <button className="btn-cancel" onClick={() => setShowPopup(false)}>
                    Cancelar
                  </button>
                  <button className="btn-confirm" onClick={handleCreateEvent}>
                    Agendar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="modal-title">Detalles de campaña</h2>
                <p className="modal-subtitle">
                  {moment(selectedEvent.start).format("YYYY-MM-DD HH:mm")}
                </p>
                <p><strong>Nombre campaña:</strong> {selectedEvent.title}</p>
                {getTemplate(selectedEvent.templateId) ? (
                  <>
                    <h4>Vista previa de la plantilla</h4>
                    <p>{getTemplate(selectedEvent.templateId).body}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      {getTemplate(selectedEvent.templateId).footer}
                    </p>
                  </>
                ) : (
                  <p>Plantilla no encontrada.</p>
                )}
                <div className="popup-buttons">
                  <button className="btn-confirm" onClick={() => setShowPopup(false)}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
