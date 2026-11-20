import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Chưa đăng nhập -> đẩy về trang Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng sai quyền -> đẩy về trang chủ
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;