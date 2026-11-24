import React from 'react';
import { Navigate } from 'react-router-dom';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  if (!token || !user || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;