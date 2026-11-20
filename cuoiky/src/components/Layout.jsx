import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isAdminPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-blue-500/30 transition">
              Q
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Quiz<span className="text-blue-600">Master</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors ${
                location.pathname === '/' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trang chủ
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Quản trị hệ thống
              </Link>
            )}
            {user?.role === 'teacher' && (
              <Link to="/teacher" className="text-slate-600 hover:text-slate-900 transition-colors">
                Ngân hàng đề thi
              </Link>
            )}
            {user?.role === 'student' && (
              <Link to="/exams" className="text-slate-600 hover:text-slate-900 transition-colors">
                Phòng thi trực tuyến
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200/60 rounded-full text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800">{user.username}</span>
                  <span className="text-slate-500 capitalize">({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-center text-xs text-slate-500">
        © 2026 QuizMaster — Hệ thống Thi Trắc Nghiệm Trực Tuyến
      </footer>
    </div>
  );
};

export default Layout;