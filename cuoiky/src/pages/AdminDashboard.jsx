import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'subjects'
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form thêm User mới
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'teacher' });

  // Form thêm / sửa Môn học
  const [subjectForm, setSubjectForm] = useState({ subjectCode: '', name: '' });
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Lấy dữ liệu ban đầu
  const fetchData = async () => {
    setLoading(true);
    setError('');
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
      setError('Không thể tải dữ liệu từ server!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- XỬ LÝ TÀI KHOẢN ---
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
      alert(data.message);
      setNewUser({ username: '', email: '', password: '', role: 'teacher' });
      fetchData();
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
      fetchData();
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
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- XỬ LÝ MÔN HỌC ---
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
      alert(data.message);
      setSubjectForm({ subjectCode: '', name: '' });
      setEditingSubjectId(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditSubject = (sub) => {
    setEditingSubjectId(sub._id);
    setSubjectForm({ subjectCode: sub.subjectCode, name: sub.name });
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
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Đang tải dữ liệu quản trị...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Bảng điều khiển Quản trị viên (Admin Dashboard)</h2>
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {/* Thống kê nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={statCardStyle}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Tổng tài khoản</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{users.length}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Giảng viên</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            {users.filter(u => u.role === 'teacher').length}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Thí sinh</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {users.filter(u => u.role === 'student').length}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Tổng môn học</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{subjects.length}</div>
        </div>
      </div>

      {/* Thanh chuyển Tab */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{ ...tabBtnStyle, backgroundColor: activeTab === 'users' ? '#2563eb' : '#e5e7eb', color: activeTab === 'users' ? '#fff' : '#374151' }}
        >
          Quản lý Tài khoản ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          style={{ ...tabBtnStyle, backgroundColor: activeTab === 'subjects' ? '#2563eb' : '#e5e7eb', color: activeTab === 'subjects' ? '#fff' : '#374151' }}
        >
          Quản lý Môn học ({subjects.length})
        </button>
      </div>

      {/* TAB 1: QUẢN LÝ TÀI KHOẢN */}
      {activeTab === 'users' && (
        <div>
          <form onSubmit={handleCreateUser} style={formBoxStyle}>
            <input type="text" placeholder="Họ và tên" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required style={inputStyle} />
            <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required style={inputStyle} />
            <input type="password" placeholder="Mật khẩu" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required style={inputStyle} />
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={inputStyle}>
              <option value="teacher">Giảng viên</option>
              <option value="student">Thí sinh</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" style={primaryBtnStyle}>+ Tạo tài khoản</button>
          </form>

          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                <th style={thTdStyle}>Họ tên</th>
                <th style={thTdStyle}>Email</th>
                <th style={thTdStyle}>Vai trò</th>
                <th style={thTdStyle}>Trạng thái</th>
                <th style={thTdStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={thTdStyle}>{u.username}</td>
                  <td style={thTdStyle}>{u.email}</td>
                  <td style={thTdStyle}>
                    <select value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px' }}>
                      <option value="student">Thí sinh</option>
                      <option value="teacher">Giảng viên</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={thTdStyle}>
                    <span style={{ color: u.isActive ? '#16a34a' : '#dc2626', fontWeight: '500' }}>
                      {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleToggleStatus(u._id)} style={{ ...actionBtnStyle, backgroundColor: u.isActive ? '#f59e0b' : '#10b981' }}>
                      {u.isActive ? 'Khóa' : 'Mở khóa'}
                    </button>
                    <button onClick={() => handleDeleteUser(u._id)} style={{ ...actionBtnStyle, backgroundColor: '#ef4444' }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ MÔN HỌC */}
      {activeTab === 'subjects' && (
        <div>
          <form onSubmit={handleSubjectSubmit} style={formBoxStyle}>
            <input type="text" placeholder="Mã môn (VD: INT1434)" value={subjectForm.subjectCode} onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })} required style={inputStyle} />
            <input type="text" placeholder="Tên môn học" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} required style={{ ...inputStyle, flex: 2 }} />
            <button type="submit" style={primaryBtnStyle}>
              {editingSubjectId ? 'Lưu cập nhật' : '+ Thêm môn học'}
            </button>
            {editingSubjectId && (
              <button type="button" onClick={() => { setEditingSubjectId(null); setSubjectForm({ subjectCode: '', name: '' }); }} style={{ ...actionBtnStyle, backgroundColor: '#6b7280', padding: '10px 14px' }}>
                Hủy
              </button>
            )}
          </form>

          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                <th style={thTdStyle}>Mã môn</th>
                <th style={thTdStyle}>Tên môn học</th>
                <th style={thTdStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(sub => (
                <tr key={sub._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={thTdStyle}><strong>{sub.subjectCode}</strong></td>
                  <td style={thTdStyle}>{sub.name}</td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleEditSubject(sub)} style={{ ...actionBtnStyle, backgroundColor: '#3b82f6' }}>Sửa</button>
                    <button onClick={() => handleDeleteSubject(sub._id)} style={{ ...actionBtnStyle, backgroundColor: '#ef4444' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles dùng chung
const statCardStyle = { backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' };
const tabBtnStyle = { padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' };
const formBoxStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const inputStyle = { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '150px' };
const primaryBtnStyle = { padding: '10px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #e5e7eb' };
const thTdStyle = { padding: '12px' };
const actionBtnStyle = { color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' };

export default AdminDashboard;