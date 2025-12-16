import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAdmin = (sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin")) === "1";
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
