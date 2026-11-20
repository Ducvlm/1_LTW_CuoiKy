import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('overview'); // 'overview' | 'users' | 'subjects'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartRange, setChartRange] = useState('7d'); // '7d' | '30d'
  const [globalSearch, setGlobalSearch] = useState('');

  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Bộ lọc trong tab Quản lý tài khoản
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form thêm User mới
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'teacher' });

  // Form thêm / sửa Môn học
  const [subjectForm, setSubjectForm] = useState({ subjectCode: '', name: '' });
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [usersRes, subjectsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', { headers: authHeaders }),
        fetch('http://localhost:5000/api/admin/subjects', { headers: authHeaders })
      ]);

      if (usersRes.status === 401 || usersRes.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const usersData = await usersRes.json();
      const subjectsData = await subjectsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- THỐNG KÊ TỪ DATABASE ---
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const locked = users.filter(u => u.isActive === false).length;
    const active = totalUsers - locked;
    return { totalUsers, students, teachers, admins, locked, active, totalSubjects: subjects.length };
  }, [users, subjects]);

  // Dữ liệu biểu đồ 7 ngày / 30 ngày dựa trên createdAt của users
  const chartData = useMemo(() => {
    const days = chartRange === '7d' ? 7 : 10;
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - (chartRange === '7d' ? i : i * 3));
      const label = chartRange === '7d'
        ? dayLabels[d.getDay()]
        : `${d.getDate()}/${d.getMonth() + 1}`;

      const count = users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        return created.toDateString() === d.toDateString();
      }).length;

      result.push({ label, value: count });
    }
    return result;
  }, [users, chartRange]);

  // Lọc danh sách users theo tìm kiếm + role + trạng thái
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.username?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(globalSearch.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive !== false) ||
        (statusFilter === 'locked' && u.isActive === false);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, globalSearch, roleFilter, statusFilter]);

  // Lọc danh sách môn học theo tìm kiếm
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s =>
      s.subjectCode?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.name?.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [subjects, globalSearch]);

  // --- CÁC HÀM XỬ LÝ CRUD ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNewUser({ username: '', email: '', password: '', role: 'teacher' });
      setShowAddUser(false);
      fetchData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ username: user.username, role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    const url = editingSubjectId
      ? `http://localhost:5000/api/admin/subjects/${editingSubjectId}`
      : 'http://localhost:5000/api/admin/subjects';
    const method = editingSubjectId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(subjectForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubjectForm({ subjectCode: '', name: '' });
      setEditingSubjectId(null);
      fetchData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- VẼ BIỂU ĐỒ ĐƯỜNG CONG SVG ---
  const renderAreaChart = () => {
    const width = 620;
    const height = 210;
    const padX = 36;
    const padY = 24;
    const maxVal = Math.max(...chartData.map(d => d.value), 5);

    const points = chartData.map((d, idx) => {
      const x = padX + (idx * (width - padX * 2)) / Math.max(chartData.length - 1, 1);
      const y = height - padY - (d.value / maxVal) * (height - padY * 2);
      return { x, y, ...d };
    });

    // Tạo đường cong mượt (Cubic Bezier)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const ctrlX = (curr.x + next.x) / 2;
      pathD += ` C ${ctrlX} ${curr.y}, ${ctrlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '220px', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Đường lưới ngang */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = height - padY - ratio * (height - padY * 2);
          const val = Math.round(ratio * maxVal);
          return (
            <g key={idx}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{val}</text>
            </g>
          );
        })}

        {/* Vùng tô dưới đường */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Đường biểu đồ chính */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {/* Các điểm dữ liệu & nhãn trục X */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill="#64748b">{p.label}</text>
          </g>
        ))}
      </svg>
    );
  };

  // --- VẼ BIỂU ĐỒ TRÒN DONUT SVG ---
  const renderDonutChart = () => {
    const total = Math.max(stats.totalUsers, 1);
    const segments = [
      { label: 'Thí sinh', value: stats.students, color: '#10b981' },
      { label: 'Giảng viên', value: stats.teachers, color: '#2563eb' },
      { label: 'Quản trị viên', value: stats.admins, color: '#f59e0b' },
      { label: 'Đã khóa', value: stats.locked, color: '#ef4444' }
    ];

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ position: 'relative', width: '156px', height: '156px' }}>
          <svg viewBox="0 0 156 156" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="78" cy="78" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
            {segments.map((seg, idx) => {
              const percent = seg.value / total;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercent * circumference;
              cumulativePercent += percent;
              if (seg.value === 0) return null;
              return (
                <circle
                  key={idx}
                  cx="78"
                  cy="78"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{stats.totalUsers}</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Tài khoản</span>
          </div>
        </div>

        {/* Chú thích */}
        <div style={{ width: '100%', marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          {segments.map((seg, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: seg.color }}></span>
                <span>{seg.label}</span>
              </div>
              <strong style={{ color: '#0f172a' }}>{seg.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f9', color: '#475569' }}>
        Đang đồng bộ dữ liệu hệ thống...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#0f172a' }}>
      {/* SIDEBAR TRÁI */}
      {sidebarOpen && (
        <aside style={{
          width: '240px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 14px',
          flexShrink: 0
        }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 10px 24px', textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                Q
              </div>
              <span style={{ fontWeight: '700', fontSize: '17px' }}>QuizMaster</span>
            </Link>

            <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', padding: '0 12px 8px', letterSpacing: '0.05em' }}>
              Quản trị viên
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'overview', label: 'Tổng quan Dashboard', icon: '📊' },
                { id: 'users', label: 'Quản lý Tài khoản', icon: '👥', badge: stats.totalUsers },
                { id: 'subjects', label: 'Quản lý Môn học', icon: '📚', badge: stats.totalSubjects }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeMenu === item.id ? '#eff6ff' : 'transparent',
                    color: activeMenu === item.id ? '#2563eb' : '#475569',
                    fontWeight: activeMenu === item.id ? '600' : '500',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      backgroundColor: activeMenu === item.id ? '#dbeafe' : '#f1f5f9',
                      color: activeMenu === item.id ? '#1d4ed8' : '#64748b'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/" style={{ padding: '8px 12px', fontSize: '13px', color: '#475569', textDecoration: 'none', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              ← Về trang chủ web
            </Link>
            <button onClick={handleLogout} style={{ padding: '8px 12px', fontSize: '13px', color: '#ef4444', backgroundColor: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: '500' }}>
              Đăng xuất tài khoản
            </button>
          </div>
        </aside>
      )}

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOP HEADER BAR (Giống ảnh mẫu) */}
        <header style={{
          height: '68px',
          backgroundColor: '#f4f6f9',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#475569', padding: '4px' }}
              title="Ẩn/hiện menu"
            >
              ☰
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {activeMenu === 'overview' ? 'Dashboard' : activeMenu === 'users' ? 'Quản lý Tài khoản' : 'Quản lý Môn học'}
              </h1>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                QuizMaster &gt; {activeMenu === 'overview' ? 'Dashboard' : activeMenu === 'users' ? 'Tài khoản' : 'Môn học'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Ô tìm kiếm nhanh */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm nhanh..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activeMenu === 'overview' && e.target.value.trim() !== '') {
                    setActiveMenu('users');
                  }
                }}
                style={{
                  width: '230px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Nút làm mới */}
            <button
              onClick={() => fetchData(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px'
              }}
              title="Làm mới dữ liệu"
            >
              {refreshing ? '⏳' : '🔄'}
            </button>

            {/* Badge Admin */}
            <div style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
              👤 {currentUser.username || 'Admin'}
            </div>
          </div>
        </header>

        {/* NỘI DUNG TỪNG MỤC */}
        <main style={{ padding: '24px 28px', maxWidth: '1360px', width: '100%', margin: '0 auto' }}>
          {/* HÀNG 1: 4 THẺ KPI VỚI VIỀN MÀU TRÊN CÙNG */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '22px' }}>
            <div style={{ ...kpiCardStyle, borderTop: '3px solid #10b981' }}>
              <div style={{ ...kpiIconBox, backgroundColor: '#ecfdf5', color: '#10b981' }}>👥</div>
              <div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Tổng tài khoản</div>
                <div style={{ fontSize: '24px', fontWeight: '700', margin: '2px 0' }}>{stats.totalUsers}</div>
                <div style={{ fontSize: '11.5px', color: '#10b981' }}>● {stats.active} đang hoạt động</div>
              </div>
            </div>

            <div style={{ ...kpiCardStyle, borderTop: '3px solid #2563eb' }}>
              <div style={{ ...kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>🎓</div>
              <div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Thí sinh đăng ký</div>
                <div style={{ fontSize: '24px', fontWeight: '700', margin: '2px 0' }}>{stats.students}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Sẵn sàng tham gia thi</div>
              </div>
            </div>

            <div style={{ ...kpiCardStyle, borderTop: '3px solid #f59e0b' }}>
              <div style={{ ...kpiIconBox, backgroundColor: '#fffbeb', color: '#f59e0b' }}>📚</div>
              <div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Môn học hệ thống</div>
                <div style={{ fontSize: '24px', fontWeight: '700', margin: '2px 0' }}>{stats.totalSubjects}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Đang mở ngân hàng đề</div>
              </div>
            </div>

            <div style={{ ...kpiCardStyle, borderTop: '3px solid #8b5cf6' }}>
              <div style={{ ...kpiIconBox, backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>🧑‍🏫</div>
              <div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Giảng viên & Quản trị</div>
                <div style={{ fontSize: '24px', fontWeight: '700', margin: '2px 0' }}>{stats.teachers + stats.admins}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>{stats.teachers} GV · {stats.admins} Admin</div>
              </div>
            </div>
          </div>

          {/* VIEW 1: TỔNG QUAN DASHBOARD */}
          {activeMenu === 'overview' && (
            <>
              {/* HÀNG 2: BIỂU ĐỒ ĐƯỜNG & BIỂU ĐỒ TRÒN DONUT */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '18px', marginBottom: '22px' }}>
                <div style={panelCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontWeight: '600', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📈</span> Thống kê tài khoản đăng ký mới
                    </div>
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                      <button
                        onClick={() => setChartRange('7d')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '12px',
                          borderRadius: '5px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: chartRange === '7d' ? '#2563eb' : 'transparent',
                          color: chartRange === '7d' ? '#fff' : '#64748b',
                          fontWeight: '500'
                        }}
                      >
                        7 ngày
                      </button>
                      <button
                        onClick={() => setChartRange('30d')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '12px',
                          borderRadius: '5px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: chartRange === '30d' ? '#2563eb' : 'transparent',
                          color: chartRange === '30d' ? '#fff' : '#64748b',
                          fontWeight: '500'
                        }}
                      >
                        30 ngày
                      </button>
                    </div>
                  </div>
                  {renderAreaChart()}
                </div>

                <div style={panelCardStyle}>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🍩</span> Cơ cấu người dùng
                  </div>
                  {renderDonutChart()}
                </div>
              </div>

              {/* HÀNG 3: TÀI KHOẢN GẦN ĐÂY & DANH MỤC MÔN HỌC */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '18px' }}>
                <div style={panelCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14.5px' }}>🕒 Tài khoản tham gia gần đây</span>
                    <button onClick={() => setActiveMenu('users')} style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                      Xem tất cả →
                    </button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', textAlign: 'left' }}>
                        <th style={{ padding: '10px 8px' }}>Họ tên</th>
                        <th style={{ padding: '10px 8px' }}>Email</th>
                        <th style={{ padding: '10px 8px' }}>Vai trò</th>
                        <th style={{ padding: '10px 8px' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map(u => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '11px 8px', fontWeight: '600', color: '#2563eb' }}>{u.username}</td>
                          <td style={{ padding: '11px 8px', color: '#475569' }}>{u.email}</td>
                          <td style={{ padding: '11px 8px' }}>
                            <span style={{
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '500',
                              backgroundColor: u.role === 'admin' ? '#f3e8ff' : u.role === 'teacher' ? '#dbeafe' : '#f1f5f9',
                              color: u.role === 'admin' ? '#7e22ce' : u.role === 'teacher' ? '#1d4ed8' : '#475569'
                            }}>
                              {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Giảng viên' : 'Thí sinh'}
                            </span>
                          </td>
                          <td style={{ padding: '11px 8px' }}>
                            <span style={{
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '500',
                              backgroundColor: u.isActive !== false ? '#dcfce7' : '#fee2e2',
                              color: u.isActive !== false ? '#15803d' : '#b91c1c'
                            }}>
                              {u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={panelCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14.5px' }}>🔥 Danh sách môn học</span>
                    <button onClick={() => setActiveMenu('subjects')} style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                      Quản lý →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {subjects.slice(0, 5).map((sub, index) => {
                      const barWidth = Math.max(35, 95 - index * 14);
                      return (
                        <div key={sub._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <span style={{ fontWeight: '700', fontSize: '12px', color: index === 0 ? '#f59e0b' : '#94a3b8', width: '16px' }}>
                              {index + 1}
                            </span>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sub.name}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Mã môn: {sub.subjectCode}</div>
                            </div>
                          </div>
                          <div style={{ width: '80px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', flexShrink: 0 }}>
                            <div style={{ width: `${barWidth}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '999px' }}></div>
                          </div>
                        </div>
                      );
                    })}
                    {subjects.length === 0 && <div style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có môn học nào trong hệ thống.</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW 2: QUẢN LÝ TÀI KHOẢN CHI TIẾT */}
          {activeMenu === 'users' && (
            <div style={panelCardStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={controlInputStyle}>
                    <option value="all">Tất cả vai trò</option>
                    <option value="student">Thí sinh</option>
                    <option value="teacher">Giảng viên</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={controlInputStyle}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  style={{ padding: '9px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {showAddUser ? '✕ Đóng biểu mẫu' : '+ Cấp tài khoản mới'}
                </button>
              </div>

              {showAddUser && (
                <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                  <input type="text" placeholder="Họ và tên" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required style={controlInputStyle} />
                  <input type="email" placeholder="Email đăng nhập" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required style={controlInputStyle} />
                  <input type="password" placeholder="Mật khẩu" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required style={controlInputStyle} />
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={controlInputStyle}>
                    <option value="teacher">Giảng viên</option>
                    <option value="student">Thí sinh</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" style={{ padding: '9px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Lưu tài khoản
                  </button>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>
                      <th style={{ padding: '12px' }}>Họ và tên</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px' }}>Phân quyền</th>
                      <th style={{ padding: '12px' }}>Trạng thái</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{u.username}</td>
                        <td style={{ padding: '12px', color: '#475569' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                          >
                            <option value="student">Thí sinh</option>
                            <option value="teacher">Giảng viên</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: u.isActive !== false ? '#dcfce7' : '#fee2e2',
                            color: u.isActive !== false ? '#15803d' : '#b91c1c'
                          }}>
                            {u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              marginRight: '8px',
                              backgroundColor: u.isActive !== false ? '#fef3c7' : '#d1fae5',
                              color: u.isActive !== false ? '#b45309' : '#047857'
                            }}
                          >
                            {u.isActive !== false ? 'Khóa' : 'Mở khóa'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#b91c1c' }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: QUẢN LÝ MÔN HỌC CHI TIẾT */}
          {activeMenu === 'subjects' && (
            <div style={panelCardStyle}>
              <form onSubmit={handleSubjectSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <input
                  type="text"
                  placeholder="Mã môn (VD: INT1434)"
                  value={subjectForm.subjectCode}
                  onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                  required
                  style={{ ...controlInputStyle, maxWidth: '200px' }}
                />
                <input
                  type="text"
                  placeholder="Tên môn học (VD: Lập trình Web)"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  required
                  style={{ ...controlInputStyle, flex: 1, minWidth: '220px' }}
                />
                <button type="submit" style={{ padding: '9px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {editingSubjectId ? 'Lưu cập nhật' : '+ Thêm môn học'}
                </button>
                {editingSubjectId && (
                  <button
                    type="button"
                    onClick={() => { setEditingSubjectId(null); setSubjectForm({ subjectCode: '', name: '' }); }}
                    style={{ padding: '9px 14px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                )}
              </form>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>
                    <th style={{ padding: '12px', width: '160px' }}>Mã môn</th>
                    <th style={{ padding: '12px' }}>Tên môn học</th>
                    <th style={{ padding: '12px', textAlign: 'right', width: '180px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map(sub => (
                    <tr key={sub._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontWeight: '600', fontSize: '12.5px' }}>
                          {sub.subjectCode}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{sub.name}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => { setEditingSubjectId(sub._id); setSubjectForm({ subjectCode: sub.subjectCode, name: sub.name }); }}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginRight: '8px', backgroundColor: '#eff6ff', color: '#2563eb' }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub._id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#b91c1c' }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Styles dùng chung
const kpiCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '18px 20px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
  borderLeft: '1px solid #e2e8f0',
  borderRight: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const kpiIconBox = {
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  flexShrink: 0
};

const panelCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
};

const controlInputStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  backgroundColor: '#ffffff',
  outline: 'none'
};

export default AdminDashboard;