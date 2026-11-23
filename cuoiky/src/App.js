import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

const WorkspacePlaceholder = ({ title, description }) => (
  <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4">
    <span className="px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/70 text-xs font-medium text-indigo-700">
      Phân hệ đang tích hợp
    </span>
    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
    <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">{description}</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <WorkspacePlaceholder
                  title="Ngân hàng đề thi & Câu hỏi"
                  description="Khu vực dành cho giảng viên biên soạn câu hỏi trắc nghiệm và tổ chức ca thi."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <WorkspacePlaceholder
                  title="Phòng thi trực tuyến"
                  description="Danh sách các đề thi đang mở và lịch sử làm bài của thí sinh."
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;