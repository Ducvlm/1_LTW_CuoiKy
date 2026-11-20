import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartRange, setChartRange] = useState('7d');
  const [globalSearch, setGlobalSearch] = useState('');

  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'teacher' });

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

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const locked = users.filter(u => u.isActive === false).length;
    const active = totalUsers - locked;
    return { totalUsers, students, teachers, admins, locked, active, totalSubjects: subjects.length };
  }, [users, subjects]);

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
        return new Date(u.createdAt).toDateString() === d.toDateString();
      }).length;

      result.push({ label, value: count });
    }
    return result;
  }, [users, chartRange]);

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

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s =>
      s.subjectCode?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.name?.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [subjects, globalSearch]);

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

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const ctrlX = (curr.x + next.x) / 2;
      pathD += ` C ${ctrlX} ${curr.y}, ${ctrlX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>

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

        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" />

        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill="#64748b">{p.label}</text>
          </g>
        ))}
      </svg>
    );
  };

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
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 156 156" className="-rotate-90 w-full h-full">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{stats.totalUsers}</span>
            <span className="text-[11px] text-slate-500">Tài khoản</span>
          </div>
        </div>

        <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}></span>
                <span>{seg.label}</span>
              </div>
              <strong className="text-slate-900">{seg.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-medium">
        Đang đồng bộ dữ liệu hệ thống...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] font-sans text-slate-900 antialiased">
      {/* SIDEBAR TRÁI */}
      {sidebarOpen && (
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0">
          <div>
            <Link to="/" className="flex items-center gap-2.5 px-2 pb-6 pt-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                Q
              </div>
              <span className="font-bold text-lg tracking-tight">QuizMaster</span>
            </Link>

            <div className="text-[11px] font-semibold text-slate-400 uppercase px-3 pb-2 tracking-wider">
              Quản trị viên
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { id: 'overview', label: 'Tổng quan Dashboard', icon: '📊' },
                { id: 'users', label: 'Quản lý Tài khoản', icon: '👥', badge: stats.totalUsers },
                { id: 'subjects', label: 'Quản lý Môn học', icon: '📚', badge: stats.totalSubjects }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeMenu === item.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <Link
              to="/"
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
            >
              ← Về trang chủ web
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-left transition cursor-pointer"
            >
              Đăng xuất tài khoản
            </button>
          </div>
        </aside>
      )}

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-[#f4f6f9] px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
              title="Ẩn/hiện menu"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {activeMenu === 'overview' ? 'Dashboard' : activeMenu === 'users' ? 'Quản lý Tài khoản' : 'Quản lý Môn học'}
              </h1>
              <div className="text-xs text-slate-400">
                QuizMaster &gt; {activeMenu === 'overview' ? 'Dashboard' : activeMenu === 'users' ? 'Tài khoản' : 'Môn học'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              className="w-56 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />

            <button
              onClick={() => fetchData(true)}
              className="w-9 h-9 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center text-sm transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              {refreshing ? '⏳' : '🔄'}
            </button>

            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              👤 {currentUser.username || 'Admin'}
            </div>
          </div>
        </header>

        {/* NỘI DUNG TỪNG MỤC */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* HÀNG 1: 4 THẺ KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-[3px] border-t-emerald-500 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                👥
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Tổng tài khoản</div>
                <div className="text-2xl font-bold text-slate-900 my-0.5">{stats.totalUsers}</div>
                <div className="text-[11px] text-emerald-600 font-medium">● {stats.active} đang hoạt động</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-[3px] border-t-blue-600 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                🎓
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Thí sinh đăng ký</div>
                <div className="text-2xl font-bold text-slate-900 my-0.5">{stats.students}</div>
                <div className="text-[11px] text-slate-400">Sẵn sàng tham gia thi</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-[3px] border-t-amber-500 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                📚
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Môn học hệ thống</div>
                <div className="text-2xl font-bold text-slate-900 my-0.5">{stats.totalSubjects}</div>
                <div className="text-[11px] text-slate-400">Đang mở ngân hàng đề</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 border-t-[3px] border-t-violet-500 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl shrink-0">
                🧑‍🏫
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Giảng viên & Quản trị</div>
                <div className="text-2xl font-bold text-slate-900 my-0.5">{stats.teachers + stats.admins}</div>
                <div className="text-[11px] text-slate-400">{stats.teachers} GV · {stats.admins} Admin</div>
              </div>
            </div>
          </div>

          {/* VIEW 1: TỔNG QUAN DASHBOARD */}
          {activeMenu === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                      <span>📈</span> Thống kê tài khoản đăng ký mới
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => setChartRange('7d')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                          chartRange === '7d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        7 ngày
                      </button>
                      <button
                        onClick={() => setChartRange('30d')}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                          chartRange === '30d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        30 ngày
                      </button>
                    </div>
                  </div>
                  {renderAreaChart()}
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <span>🍩</span> Cơ cấu người dùng
                  </div>
                  {renderDonutChart()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="font-semibold text-sm text-slate-800">🕒 Tài khoản tham gia gần đây</span>
                    <button
                      onClick={() => setActiveMenu('users')}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer"
                    >
                      Xem tất cả →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase">
                          <th className="py-2.5 px-2">Họ tên</th>
                          <th className="py-2.5 px-2">Email</th>
                          <th className="py-2.5 px-2">Vai trò</th>
                          <th className="py-2.5 px-2">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.slice(0, 5).map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-2 font-semibold text-blue-600">{u.username}</td>
                            <td className="py-3 px-2 text-slate-600">{u.email}</td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : u.role === 'teacher'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Giảng viên' : 'Thí sinh'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="font-semibold text-sm text-slate-800">🔥 Danh sách môn học</span>
                    <button
                      onClick={() => setActiveMenu('subjects')}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer"
                    >
                      Quản lý →
                    </button>
                  </div>
                  <div className="space-y-3.5">
                    {subjects.slice(0, 5).map((sub, index) => {
                      const barWidth = Math.max(35, 95 - index * 14);
                      return (
                        <div key={sub._id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`font-bold text-xs w-4 ${index === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {index + 1}
                            </span>
                            <div className="truncate">
                              <div className="text-xs font-semibold text-slate-800 truncate">{sub.name}</div>
                              <div className="text-[11px] text-slate-400">Mã môn: {sub.subjectCode}</div>
                            </div>
                          </div>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full shrink-0 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${barWidth}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                    {subjects.length === 0 && (
                      <div className="text-xs text-slate-400">Chưa có môn học nào trong hệ thống.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW 2: QUẢN LÝ TÀI KHOẢN CHI TIẾT */}
          {activeMenu === 'users' && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-2.5">
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="student">Thí sinh</option>
                    <option value="teacher">Giảng viên</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  {showAddUser ? '✕ Đóng biểu mẫu' : '+ Cấp tài khoản mới'}
                </button>
              </div>

              {showAddUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5"
                >
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email đăng nhập"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="teacher">Giảng viên</option>
                    <option value="student">Thí sinh</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                  >
                    Lưu tài khoản
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs">
                      <th className="py-3 px-3 font-semibold">Họ và tên</th>
                      <th className="py-3 px-3 font-semibold">Email</th>
                      <th className="py-3 px-3 font-semibold">Phân quyền</th>
                      <th className="py-3 px-3 font-semibold">Trạng thái</th>
                      <th className="py-3 px-3 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 font-semibold text-slate-800">{u.username}</td>
                        <td className="py-3 px-3 text-slate-600">{u.email}</td>
                        <td className="py-3 px-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="student">Thí sinh</option>
                            <option value="teacher">Giảng viên</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {u.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                              u.isActive !== false
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {u.isActive !== false ? 'Khóa' : 'Mở khóa'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-100 hover:bg-rose-200 text-rose-700 transition cursor-pointer"
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
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <form
                onSubmit={handleSubjectSubmit}
                className="flex flex-wrap gap-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5"
              >
                <input
                  type="text"
                  placeholder="Mã môn (VD: INT1434)"
                  value={subjectForm.subjectCode}
                  onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                  required
                  className="w-full sm:w-48 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tên môn học (VD: Lập trình Web)"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  required
                  className="flex-1 min-w-[220px] px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  {editingSubjectId ? 'Lưu cập nhật' : '+ Thêm môn học'}
                </button>
                {editingSubjectId && (
                  <button
                    type="button"
                    onClick={() => { setEditingSubjectId(null); setSubjectForm({ subjectCode: '', name: '' }); }}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs">
                      <th className="py-3 px-3 font-semibold w-40">Mã môn</th>
                      <th className="py-3 px-3 font-semibold">Tên môn học</th>
                      <th className="py-3 px-3 font-semibold text-right w-44">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubjects.map(sub => (
                      <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold text-xs">
                            {sub.subjectCode}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{sub.name}</td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => { setEditingSubjectId(sub._id); setSubjectForm({ subjectCode: sub.subjectCode, name: sub.name }); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-100 hover:bg-rose-200 text-rose-700 transition cursor-pointer"
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;