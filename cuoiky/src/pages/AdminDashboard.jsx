import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Search,
  Menu,
  RefreshCw,
  LogOut,
  UserPlus,
  X,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Library,
  Plus,
  Inbox,
  Loader2,
} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ToastContainer, useToasts } from '../components/ui/Toast';

/* ======================= HẰNG SỐ GIAO DIỆN ======================= */
const cardCls = 'bg-white rounded-xl border border-slate-200/80 shadow-sm';

const inputCls =
  'w-full h-9 px-3 text-sm rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';

const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

const btnGhost =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

const iconBtn =
  'inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

const thCls = 'py-3 px-4 text-xs font-medium uppercase tracking-wide text-slate-500';

const ROLE_META = {
  admin: { label: 'Admin', className: 'bg-violet-50 text-violet-700 ring-violet-600/15' },
  teacher: { label: 'Giảng viên', className: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15' },
  student: { label: 'Thí sinh', className: 'bg-slate-100 text-slate-700 ring-slate-500/15' },
};

const PAGE_META = {
  overview: { title: 'Tổng quan', crumb: 'Tổng quan' },
  users: { title: 'Quản lý tài khoản', crumb: 'Tài khoản' },
  subjects: { title: 'Quản lý môn học', crumb: 'Môn học' },
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');

/* ======================= COMPONENT PHỤ ======================= */
const RoleBadge = ({ role }) => {
  const meta = ROLE_META[role] || ROLE_META.student;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${meta.className}`}
    >
      {meta.label}
    </span>
  );
};

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${
      active
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
        : 'bg-rose-50 text-rose-700 ring-rose-600/15'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    {active ? 'Hoạt động' : 'Đã khóa'}
  </span>
);

const Avatar = ({ name, className = 'w-8 h-8 text-xs' }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold shrink-0 ${className}`}
  >
    {(name || '?').charAt(0).toUpperCase()}
  </span>
);

const KpiCard = ({ icon: Icon, label, value, hint }) => (
  <div className={`${cardCls} p-5 flex items-start gap-4`}>
    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500 truncate">{hint}</div>
    </div>
  </div>
);

const EmptyState = ({ title, hint }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
      <Inbox size={20} />
    </div>
    <div className="mt-3 text-sm font-medium text-slate-700">{title}</div>
    <div className="mt-1 text-xs text-slate-500">{hint}</div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="flex min-h-screen bg-slate-50">
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col p-4 gap-3 shrink-0">
      <Skeleton className="h-8 w-36" />
      <div className="mt-6 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </aside>
    <div className="flex-1 min-w-0">
      <div className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-56" />
      </div>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${cardCls} p-5 flex gap-4`}>
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`${cardCls} lg:col-span-2 p-5`}>
            <Skeleton className="h-4 w-48 mb-5" />
            <Skeleton className="h-52 w-full" />
          </div>
          <div className={`${cardCls} p-5`}>
            <Skeleton className="h-4 w-32 mb-5" />
            <Skeleton className="h-40 w-40 rounded-full mx-auto" />
          </div>
        </div>
        <div className={`${cardCls} p-5 space-y-3`}>
          <Skeleton className="h-4 w-44" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ======================= TRANG CHÍNH ======================= */
const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
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

  // State giao diện mới: modal xác nhận, trạng thái gửi form, toast
  const [confirmTarget, setConfirmTarget] = useState(null); // { kind: 'user' | 'subject', id, name }
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();

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
      pushToast('error', 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.');
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

  /* ---------- HÀNH ĐỘNG VỚI API (giữ nguyên endpoint & payload) ---------- */
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
      pushToast('success', data.message || 'Tạo tài khoản thành công!');
      fetchData(true);
    } catch (err) {
      pushToast('error', err.message);
    } finally {
      setSubmitting(false);
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
      pushToast('success', data.message || 'Cập nhật người dùng thành công!');
      fetchData(true);
    } catch (err) {
      pushToast('error', err.message);
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
      pushToast('success', data.message);
      fetchData(true);
    } catch (err) {
      pushToast('error', err.message);
    }
  };

  // Hàm xóa thực thi sau khi người dùng bấm "Xác nhận" trong modal
  const handleDeleteUser = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      pushToast('success', data.message || 'Đã xóa người dùng thành công!');
      fetchData(true);
    } catch (err) {
      pushToast('error', err.message);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    const url = editingSubjectId
      ? `http://localhost:5000/api/admin/subjects/${editingSubjectId}`
      : 'http://localhost:5000/api/admin/subjects';
    const method = editingSubjectId ? 'PUT' : 'POST';

    setSubmitting(true);
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
      pushToast('success', data.message);
      fetchData(true);
    } catch (err) {
      pushToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm xóa thực thi sau khi người dùng bấm "Xác nhận" trong modal
  const handleDeleteSubject = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/subjects/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      pushToast('success', data.message || 'Đã xóa môn học thành công!');
      fetchData(true);
    } catch (err) {
      pushToast('error', err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    if (confirmTarget.kind === 'user') {
      await handleDeleteUser(confirmTarget.id);
    } else {
      await handleDeleteSubject(confirmTarget.id);
    }
    setConfirming(false);
    setConfirmTarget(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleMenuClick = (id) => {
    setActiveMenu(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  /* ---------- BIỂU ĐỒ ---------- */
  const renderAreaChart = () => {
    const width = 620;
    const height = 220;
    const padX = 36;
    const padY = 28;
    const rawMax = Math.max(...chartData.map(d => d.value), 0);
    const maxVal = Math.max(4, Math.ceil(rawMax / 4) * 4);

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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = height - padY - ratio * (height - padY * 2);
          const val = Math.round(ratio * maxVal);
          return (
            <g key={idx}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={ratio === 0 ? '0' : '3 4'} />
              <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{val}</text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />

        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="2">
              <title>{`${p.label}: ${p.value} tài khoản`}</title>
            </circle>
            <text x={p.x} y={height - 6} textAnchor="middle" fontSize="11" fill="#64748b">{p.label}</text>
          </g>
        ))}
      </svg>
    );
  };

  const renderDonutChart = () => {
    const total = Math.max(stats.totalUsers, 1);
    const segments = [
      { label: 'Thí sinh', value: stats.students, color: '#4f46e5' },
      { label: 'Giảng viên', value: stats.teachers, color: '#38bdf8' },
      { label: 'Quản trị viên', value: stats.admins, color: '#94a3b8' }
    ];

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let offsetAcc = 0;
    const arcs = segments.map(seg => {
      const len = (seg.value / total) * circumference;
      const arc = { ...seg, len, offset: offsetAcc };
      offsetAcc += len;
      return arc;
    });

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 156 156" className="-rotate-90 w-full h-full">
            <circle cx="78" cy="78" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
            {arcs.map((arc, idx) =>
              arc.value === 0 ? null : (
                <circle
                  key={idx}
                  cx="78"
                  cy="78"
                  r={radius}
                  fill="transparent"
                  stroke={arc.color}
                  strokeWidth="18"
                  strokeDasharray={`${arc.len} ${circumference - arc.len}`}
                  strokeDashoffset={-arc.offset}
                />
              )
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-slate-900">{stats.totalUsers}</span>
            <span className="text-xs text-slate-500">Tài khoản</span>
          </div>
        </div>

        <div className="w-full mt-5 space-y-2">
          {arcs.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                {seg.label}
              </div>
              <div className="text-slate-900 font-medium">
                {seg.value}
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  {Math.round((seg.value / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock size={12} /> Tài khoản đang bị khóa
          </span>
          <strong className="text-slate-700">{stats.locked}</strong>
        </div>
      </div>
    );
  };

  const renderSearch = (wrapperCls) => (
    <div className={`relative ${wrapperCls}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Tìm kiếm nhanh..."
        value={globalSearch}
        onChange={(e) => {
          setGlobalSearch(e.target.value);
          if (activeMenu === 'overview' && e.target.value.trim() !== '') {
            setActiveMenu('users');
          }
        }}
        className={`${inputCls} pl-9`}
      />
    </div>
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  const meta = PAGE_META[activeMenu];
  const navItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Quản lý tài khoản', icon: Users, badge: stats.totalUsers },
    { id: 'subjects', label: 'Quản lý môn học', icon: BookOpen, badge: stats.totalSubjects }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmModal
        open={!!confirmTarget}
        title={confirmTarget?.kind === 'user' ? 'Xóa tài khoản?' : 'Xóa môn học?'}
        message={
          confirmTarget
            ? `“${confirmTarget.name}” sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa vĩnh viễn"
        loading={confirming}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 lg:static lg:z-auto bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0">
          <div>
            <div className="flex items-center justify-between pb-6 pt-1 px-1">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <GraduationCap size={18} />
                </div>
                <span className="text-base font-semibold tracking-tight">
                  Quiz<span className="text-indigo-600">Master</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Đóng menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Quản trị
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={18} />
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-md ${
                          active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-1">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
            >
              <ArrowLeft size={16} />
              Về trang chủ
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-left transition cursor-pointer"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </aside>
      )}

      {/* KHU VỰC NỘI DUNG */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md px-4 sm:px-6 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
              title="Ẩn/hiện menu"
              aria-label="Ẩn/hiện menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
                QuizMaster <ChevronRight size={12} /> {meta.crumb}
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 truncate leading-7">{meta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {renderSearch('hidden md:block w-64')}

            <button
              onClick={() => fetchData(true)}
              className="w-9 h-9 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 transition cursor-pointer"
              title="Làm mới dữ liệu"
              aria-label="Làm mới dữ liệu"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-1 pr-3 h-9 bg-white border border-slate-200 rounded-full">
              <Avatar name={currentUser.username || 'Admin'} className="w-7 h-7 text-xs" />
              <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {currentUser.username || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Ô tìm kiếm cho mobile */}
          {renderSearch('md:hidden')}

          {/* ===================== TỔNG QUAN ===================== */}
          {activeMenu === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  icon={Users}
                  label="Tổng tài khoản"
                  value={stats.totalUsers}
                  hint={`${stats.active} đang hoạt động`}
                />
                <KpiCard
                  icon={GraduationCap}
                  label="Thí sinh đăng ký"
                  value={stats.students}
                  hint="Sẵn sàng tham gia thi"
                />
                <KpiCard
                  icon={Library}
                  label="Môn học"
                  value={stats.totalSubjects}
                  hint="Đang có trong hệ thống"
                />
                <KpiCard
                  icon={ShieldCheck}
                  label="Giảng viên & Quản trị"
                  value={stats.teachers + stats.admins}
                  hint={`${stats.teachers} giảng viên · ${stats.admins} admin`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className={`${cardCls} lg:col-span-2 p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <TrendingUp size={16} className="text-slate-400" />
                      Tài khoản đăng ký mới
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                      {[
                        { id: '7d', label: '7 ngày' },
                        { id: '30d', label: '30 ngày' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setChartRange(opt.id)}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                            chartRange === opt.id
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {renderAreaChart()}
                </div>

                <div className={`${cardCls} p-5`}>
                  <div className="text-sm font-medium text-slate-900 mb-4">Cơ cấu người dùng</div>
                  {renderDonutChart()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className={`${cardCls} lg:col-span-3 overflow-hidden`}>
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <span className="text-sm font-medium text-slate-900">Tài khoản tham gia gần đây</span>
                    <button
                      onClick={() => setActiveMenu('users')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      Xem tất cả <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50/70 border-y border-slate-100">
                          <th className={thCls}>Người dùng</th>
                          <th className={thCls}>Vai trò</th>
                          <th className={thCls}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.slice(0, 5).map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={u.username} />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-slate-900 truncate">{u.username}</div>
                                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                            <td className="py-3 px-4"><StatusBadge active={u.isActive !== false} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length === 0 && (
                      <EmptyState title="Chưa có tài khoản nào" hint="Tài khoản mới sẽ xuất hiện tại đây." />
                    )}
                  </div>
                </div>

                <div className={`${cardCls} lg:col-span-2 p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-900">Môn học</span>
                    <button
                      onClick={() => setActiveMenu('subjects')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      Quản lý <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {subjects.slice(0, 5).map(sub => (
                      <div key={sub._id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0 text-sm font-medium text-slate-800 truncate">{sub.name}</div>
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          {sub.subjectCode}
                        </span>
                      </div>
                    ))}
                    {subjects.length === 0 && (
                      <EmptyState title="Chưa có môn học" hint="Thêm môn học trong mục Quản lý môn học." />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===================== QUẢN LÝ TÀI KHOẢN ===================== */}
          {activeMenu === 'users' && (
            <div className={`${cardCls} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className={`${inputCls} w-auto`}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="student">Thí sinh</option>
                    <option value="teacher">Giảng viên</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className={`${inputCls} w-auto`}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                  <span className="text-xs text-slate-500">{filteredUsers.length} tài khoản</span>
                </div>

                <button onClick={() => setShowAddUser(!showAddUser)} className={showAddUser ? btnGhost : btnPrimary}>
                  {showAddUser ? <X size={16} /> : <UserPlus size={16} />}
                  {showAddUser ? 'Đóng biểu mẫu' : 'Cấp tài khoản mới'}
                </button>
              </div>

              {showAddUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="mx-4 sm:mx-5 mb-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end animate-fade-in"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={newUser.username}
                      onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Email đăng nhập</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Mật khẩu</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Vai trò</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      className={inputCls}
                    >
                      <option value="teacher">Giảng viên</option>
                      <option value="student">Thí sinh</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit" disabled={submitting} className={btnPrimary}>
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    Lưu tài khoản
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 border-y border-slate-100">
                      <th className={thCls}>Người dùng</th>
                      <th className={thCls}>Phân quyền</th>
                      <th className={thCls}>Trạng thái</th>
                      <th className={`${thCls} hidden lg:table-cell`}>Ngày tạo</th>
                      <th className={`${thCls} text-right`}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => {
                      const isSelf = u._id === currentUser.id;
                      const isActive = u.isActive !== false;
                      return (
                        <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.username} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-900 truncate">{u.username}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-medium">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 transition"
                            >
                              <option value="student">Thí sinh</option>
                              <option value="teacher">Giảng viên</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4"><StatusBadge active={isActive} /></td>
                          <td className="py-3.5 px-4 text-slate-500 hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleStatus(u._id)}
                                disabled={isSelf}
                                title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                aria-label={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                className={`${iconBtn} ${
                                  isActive
                                    ? 'hover:bg-amber-50 hover:text-amber-600'
                                    : 'hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                              >
                                {isActive ? <Lock size={16} /> : <Unlock size={16} />}
                              </button>
                              <button
                                onClick={() => setConfirmTarget({ kind: 'user', id: u._id, name: u.username })}
                                disabled={isSelf}
                                title="Xóa tài khoản"
                                aria-label="Xóa tài khoản"
                                className={`${iconBtn} hover:bg-rose-50 hover:text-rose-600`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <EmptyState title="Không tìm thấy tài khoản" hint="Hãy thử đổi từ khóa hoặc bộ lọc." />
                )}
              </div>
            </div>
          )}

          {/* ===================== QUẢN LÝ MÔN HỌC ===================== */}
          {activeMenu === 'subjects' && (
            <div className={`${cardCls} overflow-hidden`}>
              <form
                onSubmit={handleSubjectSubmit}
                className="m-4 sm:m-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-wrap items-end gap-3"
              >
                <div className="w-full sm:w-48">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Mã môn</label>
                  <input
                    type="text"
                    placeholder="VD: INT1434"
                    value={subjectForm.subjectCode}
                    onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Tên môn học</label>
                  <input
                    type="text"
                    placeholder="VD: Lập trình Web"
                    value={subjectForm.name}
                    onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>
                <button type="submit" disabled={submitting} className={btnPrimary}>
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : editingSubjectId ? null : <Plus size={16} />}
                  {editingSubjectId ? 'Lưu cập nhật' : 'Thêm môn học'}
                </button>
                {editingSubjectId && (
                  <button
                    type="button"
                    onClick={() => { setEditingSubjectId(null); setSubjectForm({ subjectCode: '', name: '' }); }}
                    className={btnGhost}
                  >
                    Hủy
                  </button>
                )}
              </form>

              <div className="px-4 sm:px-5 pb-3 text-xs text-slate-500">{filteredSubjects.length} môn học</div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 border-y border-slate-100">
                      <th className={`${thCls} w-40`}>Mã môn</th>
                      <th className={thCls}>Tên môn học</th>
                      <th className={`${thCls} text-right w-32`}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubjects.map(sub => (
                      <tr
                        key={sub._id}
                        className={`transition-colors ${
                          editingSubjectId === sub._id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                            {sub.subjectCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">{sub.name}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingSubjectId(sub._id); setSubjectForm({ subjectCode: sub.subjectCode, name: sub.name }); }}
                              title="Sửa môn học"
                              aria-label="Sửa môn học"
                              className={`${iconBtn} hover:bg-indigo-50 hover:text-indigo-600`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setConfirmTarget({ kind: 'subject', id: sub._id, name: sub.name })}
                              title="Xóa môn học"
                              aria-label="Xóa môn học"
                              className={`${iconBtn} hover:bg-rose-50 hover:text-rose-600`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSubjects.length === 0 && (
                  <EmptyState title="Không có môn học nào" hint="Thêm môn học mới bằng biểu mẫu phía trên." />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;