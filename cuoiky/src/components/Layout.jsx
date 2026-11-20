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

  // Trang Admin dùng khung giao diện Dashboard chuyên biệt
  if (isAdminPage) {
    return <Outlet />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Thanh Navbar hiện đại */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#0f172a' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Q
            </div>
            <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.02em' }}>
              Quiz<span style={{ color: '#2563eb' }}>Master</span>
            </span>
          </Link>

          {/* Menu điều hướng giữa */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', fontWeight: '500' }}>
            <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? '#2563eb' : '#475569' }}>
              Trang chủ
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '600' }}>
                Quản trị hệ thống
              </Link>
            )}
            {user?.role === 'teacher' && (
              <Link to="/teacher" style={{ textDecoration: 'none', color: '#475569' }}>
                Ngân hàng đề thi
              </Link>
            )}
            {user?.role === 'student' && (
              <Link to="/exams" style={{ textDecoration: 'none', color: '#475569' }}>
                Phòng thi trực tuyến
              </Link>
            )}
          </nav>

          {/* Khu vực tài khoản bên phải */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', backgroundColor: '#f1f5f9', borderRadius: '999px', fontSize: '13px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{user.username}</span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#ef4444',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  textDecoration: 'none',
                  borderRadius: '8px'
                }}>
                  Đăng nhập
                </Link>
                <Link to="/register" style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#fff',
                  backgroundColor: '#2563eb',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
                }}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Nội dung chính */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer tối giản */}
      <footer style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '20px 24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        © 2026 QuizMaster — Hệ thống Thi Trắc Nghiệm Trực Tuyến
      </footer>
    </div>
  );
};

export default Layout;