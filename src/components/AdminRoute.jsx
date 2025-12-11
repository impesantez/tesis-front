// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ADMIN_EMAIL = "LinhTranMakeup@gmail.com";

export default function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.email !== ADMIN_EMAIL) return <Navigate to="/" replace />; // redirect non-admin to calendar
  return children;
}
