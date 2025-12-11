import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import NailTechsPage from "./NailTechsPage";
import ServicesPage from "./ServicesPage";
import SalesReportPage from "./SalesReportPage";
import ContactUsPage from "./ContactUsPage";
import AppointmentModal from "../components/AppointmentModal";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { role, logout } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState("calendar");
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [nailTechs, setNailTechs] = useState([]);
  const [services, setServices] = useState([]);
  const [openTechs, setOpenTechs] = useState({}); // <-- controla el desplegable por día

  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isAdminOrStaff = isAdmin || isStaff;
  const isViewer = !role || role === "viewer";

  const refreshData = async () => {
    await loadNailTechs();
    await loadServices();
    await loadAppointments();
  };

  const loadNailTechs = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/nailtechs");
      const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setNailTechs(sorted);
    } catch (err) {
      console.error("Error loading nail techs:", err);
    }
  };

  const loadServices = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/services");
      const sorted = res.data.sort((a, b) => {
        const catA = (a.category || "").toLowerCase();
        const catB = (b.category || "").toLowerCase();
        if (catA !== catB) return catA.localeCompare(catB);
        return a.name.localeCompare(b.name);
      });
      setServices(sorted);
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatYMD = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const getStartOfWeek = (date) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() - copy.getDay());
    return copy;
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const weekdayName = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });

  const techsAvailableThatDay = (date) => {
    const day = weekdayName(date);
    return nailTechs.filter((t) => {
      if (!t.availabilityJson) return false;
      try {
        const arr = JSON.parse(t.availabilityJson);
        return Array.isArray(arr) && arr.includes(day);
      } catch {
        return false;
      }
    });
  };

  const handleSaveAppointment = async (formData) => {
  try {
    const payload = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      nailTechId: formData.nailTechId ? Number(formData.nailTechId) : null,
      serviceIds: formData.serviceIds.map((id) => Number(id)),
    };

    if (editingAppointment) {
      const res = await axios.put(
        `http://localhost:8080/api/appointments/${editingAppointment.id}`,
        payload
      );
      setAppointments((prev) =>
        prev.map((a) => (a.id === editingAppointment.id ? res.data : a))
      );
    } else {
      const res = await axios.post(
        "http://localhost:8080/api/appointments",
        payload
      );
      setAppointments((prev) => [...prev, res.data]);
    }

    setShowModal(false);
    setEditingAppointment(null);
  } catch (err) {
    console.error("Failed saving appointment:", err);
    alert("Error saving appointment.");
  }
};

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed deleting appointment:", err);
      alert("Error deleting appointment");
    }
  };

  const handleToggleComplete = async (appt) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/appointments/${appt.id}/complete`,
        { completed: !appt.completed }
      );
      const updated = res.data || { ...appt, completed: !appt.completed };
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? updated : a))
      );
    } catch (err) {
      alert("Could not toggle completion.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#f8f7f3",
        minHeight: "100vh",
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          zIndex: 10,
        }}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={async () => {
            await logout?.();
            window.location = "/dashboard";
          }}
        />
      </div>

      <div style={{ marginLeft: "220px", flex: 1 }}>
        {currentPage === "nailtechs" && (
          <NailTechsPage role={role} onChange={refreshData} />
        )}
        {currentPage === "services" && (
          <ServicesPage role={role} onChange={refreshData} />
        )}
        {currentPage === "sales" && isAdminOrStaff && (
          <SalesReportPage role={role} />
        )}
        {currentPage === "contact" && <ContactUsPage />}

        {currentPage === "calendar" && (
          <>
            {/* HEADER */}
            <div
              style={{
                backgroundColor: "#2b4c3f",
                color: "white",
                padding: "15px 30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70px",
                position: "relative",
                boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <button
                  onClick={() => {
                    let d = new Date(currentDate);
                    d.setDate(d.getDate() - 7);
                    setCurrentDate(d);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>

                <h2
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  {startOfWeek.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(
                    startOfWeek.getTime() + 6 * 86400000
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </h2>

                <button
                  onClick={() => {
                    let d = new Date(currentDate);
                    d.setDate(d.getDate() + 7);
                    setCurrentDate(d);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </div>

              {isAdminOrStaff && (
                <button
                  onClick={() => {
                    setEditingAppointment(null);
                    setShowModal(true);
                  }}
                  style={{
                    position: "absolute",
                    right: "30px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "#1f392f",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "999px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 3px 9px rgba(0,0,0,0.4)",
                  }}
                >
                  + New Appointment
                </button>
              )}
            </div>

            {/* CALENDAR GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                backgroundColor: "#f8f7f3",
              }}
            >
              {days.map((day, idx) => {
                const dayKey = formatYMD(day);
                const daily = appointments.filter((a) => a.date === dayKey);
                const availTechs = techsAvailableThatDay(day);
                const isTechOpen = !!openTechs[dayKey];

                return (
                  <div
                    key={idx}
                    style={{
                      borderRight: "1px solid #2b4c3f",
                      padding: "18px 14px",
                      minHeight: "240px",
                      textAlign: "center",
                    }}
                  >
                    {/* Día */}
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#2b4c3f",
                        lineHeight: 1.1,
                      }}
                    >
                      {day.getDate()}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        marginBottom: "10px",
                        color: "#1f392f",
                        fontWeight: 600,
                      }}
                    >
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>

                    {/* PILL DESPLEGABLE */}
                    <div style={{ marginBottom: isTechOpen ? "4px" : "12px" }}>
                      <button
                        onClick={() =>
                          setOpenTechs((prev) => ({
                            ...prev,
                            [dayKey]: !prev[dayKey],
                          }))
                        }
                        style={{
                          padding: "6px 18px",
                          borderRadius: "999px",
                          backgroundColor: "#dcefe6",
                          border: "1px solid #c0d8cc",
                          boxShadow: "0 3px 8px rgba(0,0,0,0.20)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1f392f",
                        }}
                      >
                        <span>Available Techs</span>
                        <span
                          style={{
                            fontSize: "11px",
                            transform: isTechOpen ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          ▾
                        </span>
                      </button>

                      {isTechOpen && (
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#1f392f",
                            lineHeight: 1.4,
                          }}
                        >
                          {availTechs.length
                            ? availTechs.map((t) => t.name).join(", ")
                            : "No availability"}
                        </div>
                      )}
                    </div>

                    {/* APPOINTMENTS */}
                    {daily.map((a) => {
                      const clientName =
                        a.client?.name || a.clientName || "Client";
                      const techName =
                        a.nailTech?.name ||
                        nailTechs.find((t) => t.id === a.nailTechId)?.name ||
                        "";
                      const serviceNames = a.services
                        ? a.services.map((s) => s.name).join(", ")
                        : "";

                      const primaryLine = isViewer
                        ? techName || "Busy"
                        : clientName;
                      const secondaryLine = isViewer
                        ? ""
                        : serviceNames +
                          (techName ? ` • ${techName}` : "");

                      const isCompleted = !!a.completed;

                      return (
                        <div
                          key={a.id}
                          style={{
                            backgroundColor: isCompleted ? "#d9e5db" : "#dcefe6",
                            margin: "10px 0",
                            padding: "12px 14px",
                            borderRadius: "18px",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.28)",
                            opacity: isCompleted ? 0.9 : 1,
                            fontStyle: isCompleted ? "italic" : "normal",
                            textAlign: "left",
                            transition: "transform 0.18s ease, box-shadow 0.18s ease",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "700",
                              fontSize: "16px",
                              color: "#1f392f",
                              marginBottom: "3px",
                            }}
                          >
                            {primaryLine}
                          </div>

                          {!isViewer && secondaryLine && (
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#2b4c3f",
                                marginBottom: "2px",
                              }}
                            >
                              {secondaryLine}
                            </div>
                          )}

                          <div
                            style={{
                              fontSize: "12px",
                              color: "#444",
                              marginBottom: "4px",
                            }}
                          >
                            {a.startTime}
                            {a.endTime ? ` - ${a.endTime}` : ""}
                          </div>

                          {/* BADGE Completed */}
                          {isCompleted && (
                            <div
                              style={{
                                marginTop: "4px",
                                marginBottom: "6px",
                                backgroundColor: "#d9e5db",
                                color: "#2b4c3f",
                                padding: "3px 9px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontStyle: "italic",
                                fontWeight: 600,
                                border: "1px solid #c6d9cd",
                                width: "fit-content",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
                              }}
                            >
                              ✓ Completed
                            </div>
                          )}

                          {isAdminOrStaff && (
  <div
    style={{
      marginTop: "8px",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "8px",
      flexDirection: "column",   // 👈 LOS BOTONES Y EL CHECK VAN EN COLUMNA
    }}
  >
    {/* --- BOTONES EDIT / DELETE --- */}
    <div
      style={{
        display: "flex",
        gap: "8px",
        width: "100%",
        justifyContent: "flex-start",
      }}
    >
      <button
        onClick={() => {
          setEditingAppointment(a);
          setShowModal(true);
        }}
        style={{
          backgroundColor: "#1f392f",
          color: "white",
          border: "none",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "13px",
          cursor: "pointer",
          boxShadow: "0 2px 7px rgba(0,0,0,0.35)",
        }}
      >
        Edit
      </button>

      {isAdmin && (
        <button
          onClick={() => handleDelete(a.id)}
          style={{
            backgroundColor: "#a44c4c",
            color: "white",
            border: "none",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 7px rgba(0,0,0,0.35)",
          }}
        >
          Delete
        </button>
      )}
    </div>

    {/* --- CHECKBOX DE COMPLETADO --- */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "6px",
        cursor: "pointer",
        fontSize: "13px",
        color: "#1f392f",
        fontWeight: 600,
        backgroundColor: "#eef6f1",
        padding: "6px 12px",
        borderRadius: "999px",
        border: "1px solid #c9dfd1",
        width: "fit-content",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={() => handleToggleComplete(a)}
        style={{
          width: "18px",
          height: "18px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "1px solid #1f392f",
        }}
      />
      Mark as completed
    </label>
  </div>
)}

                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showModal && isAdminOrStaff && (
        <AppointmentModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveAppointment}
          existingData={editingAppointment}
          nailTechs={nailTechs}
          services={services}
        />
      )}
    </div>
  );
}
