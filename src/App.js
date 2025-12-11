import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Login SOLO para admin/staff (ruta secreta) */}
            <Route path="/admin" element={<LoginPage />} />

            {/* Dashboard público (viewer por defecto) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Raíz → Dashboard público */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Rutas desconocidas → Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
