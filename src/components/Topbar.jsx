import React from "react";
import logo from "../assets/dummy.png";

export default function Topbar({ currentWeek, onPrevWeek, onNextWeek, onNewAppointment }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1f392f",
        color: "#fff",
        padding: "12px 20px",
        height: "70px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          alt="Salon Logo"
          style={{ height: "45px", marginRight: "12px", borderRadius: "6px" }}
        />
        <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Get Nail’d LA Scheduler
        </h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={onPrevWeek}
          style={{
            background: "#2b4c3f",
            border: "none",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: "16px", fontWeight: "500" }}>{currentWeek}</span>
        <button
          onClick={onNextWeek}
          style={{
            background: "#2b4c3f",
            border: "none",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Next →
        </button>
        <button
          onClick={onNewAppointment}
          style={{
            backgroundColor: "#2b4c3f",
            border: "none",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + New Appointment
        </button>
      </div>
    </header>
  );
}
