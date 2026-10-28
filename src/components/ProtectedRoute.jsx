import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirect unauthorized roles back to their authorized workspace
      return <Navigate to={`/dashboards/${userRole}`} replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('access_token');
    return <Navigate to="/signin" replace />;
  }
}