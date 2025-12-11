import React from "react";
import logo from "../assets/dummy.png";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ currentPage, onNavigate, onLogout }) {
  const { role } = useAuth();
  const isAdminOrStaff = role === "admin" || role === "staff";
  const isViewer = !role || role === "viewer";

  const buttonStyle = (active) => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 18px",
    margin: "6px 0",
    backgroundColor: active ? "#1f392f" : "transparent",
    color: active ? "#ffffff" : "#f8f7f3",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: active ? "600" : "400",
    fontSize: "15px",
    transition: "background-color 0.2s ease, transform 0.2s ease",
  });

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        backgroundColor: "#2b4c3f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 10px",
        boxShadow: "2px 0 5px rgba(0,0,0,0.15)",
        justifyContent: "space-between",
      }}
    >
      {/* ===== LOGO ===== */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <img src={logo} alt="Salon Logo" style={{ width: "140px", borderRadius: "8px" }} />
        </div>

        {/* ===== COMMON BUTTONS ===== */}
        <button
          style={buttonStyle(currentPage === "calendar")}
          onClick={() => onNavigate("calendar")}
        >
          Calendar
        </button>

        <button
          style={buttonStyle(currentPage === "nailtechs")}
          onClick={() => onNavigate("nailtechs")}
        >
          Nail Technicians
        </button>

        {/* Services visible para todos (viewer ve solo lista, admin edita) */}
        <button
          style={buttonStyle(currentPage === "services")}
          onClick={() => onNavigate("services")}
        >
          Services
        </button>

        {/* Sales solo Admin & Staff */}
        {isAdminOrStaff && (
          <button
            style={buttonStyle(currentPage === "sales")}
            onClick={() => onNavigate("sales")}
          >
            Sales Report
          </button>
        )}

        {/* Contact Us visible para todos */}
        <button
          style={buttonStyle(currentPage === "contact")}
          onClick={() => onNavigate("contact")}
        >
          Contact Us
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ width: "100%", marginBottom: "40px", textAlign: "center" }}>
        {/* Oculta rol si es viewer */}
        {!isViewer && (
          <p style={{ color: "#c5c5c5", fontSize: "14px", marginBottom: "10px" }}>
            Role: <strong style={{ color: "white" }}>{role?.toUpperCase()}</strong>
          </p>
        )}

        {/* Log Out solo si NO es viewer */}
        {!isViewer && (
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #2b4c3f 0%, #a44c4c 100%)",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              transition: "all 0.3s ease",
            }}
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
