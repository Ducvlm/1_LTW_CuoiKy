import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut, Menu, X, Home, ShieldCheck, Library, ClipboardList } from 'lucide-react';

const ROLE_LABEL = {
  admin: 'Quản trị viên',
  teacher: 'Giảng viên',
  student: 'Thí sinh',
};

const ROLE_STYLE = {
  admin: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  teacher: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  student: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileOpen(false);
    navigate('/login');
  };

  if (isAdminPage) {
    return <Outlet />;
  }

  const navItems = [{ to: '/', label: 'Trang chủ', icon: Home, end: true }];
  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Quản trị hệ thống', icon: ShieldCheck });
  }
  if (user?.role === 'teacher') {
    navItems.push({ to: '/teacher', label: 'Ngân hàng đề thi', icon: Library });
  }
  if (user?.role === 'student') {
    navItems.push({ to: '/exams', label: 'Phòng thi trực tuyến', icon: ClipboardList });
  }

  const desktopLinkCls = ({ isActive }) =>
    `relative h-16 inline-flex items-center text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-indigo-600 after:rounded-full'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  const mobileLinkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <GraduationCap size={18} />
              </div>
              <span className="text-base font-semibold tracking-tight text-slate-900">
                Quiz<span className="text-indigo-600">Master</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-7">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkCls}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-slate-200 bg-white">
                  <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center">
                    {(user.username || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-slate-800 max-w-[140px] truncate">
                    {user.username}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${
                      ROLE_STYLE[user.role] || ROLE_STYLE.student
                    }`}
                  >
                    {ROLE_LABEL[user.role] || user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center h-9 px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center h-9 px-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  Đăng ký
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Mở menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={mobileLinkCls}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center shrink-0">
                      {(user.username || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{user.username}</div>
                      <div className="text-xs text-slate-500">{ROLE_LABEL[user.role] || user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="h-10 inline-flex items-center justify-center text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="h-10 inline-flex items-center justify-center text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-5 px-6 text-center text-xs text-slate-500">
        © 2026 QuizMaster — Hệ thống thi trắc nghiệm trực tuyến
      </footer>
    </div>
  );
};

export default Layout;