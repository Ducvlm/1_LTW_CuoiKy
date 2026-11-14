import React, { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Lắng nghe thay đổi dữ liệu trên input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Xử lý khi bấm nút Đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại!');
      }

      setSuccessMessage('Đăng nhập thành công!');
      
      // Lưu token và thông tin user vào localStorage để dùng cho các trang sau
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('Token nhận được:', data.token);
      console.log('Thông tin user:', data.user);

      // (Tùy chọn) Chuyển hướng người dùng dựa vào role (admin, teacher, student)
      // Ví dụ: if (data.user.role === 'admin') { window.location.href = '/admin'; }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="welcome-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Đăng nhập hệ thống</h2>
      <p style={{ margin: '15px 0', color: '#6b7280' }}>Nhập thông tin tài khoản của bạn.</p>

      {/* Hiển thị thông báo lỗi hoặc thành công */}
      {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', marginBottom: '10px', fontSize: '14px' }}>{successMessage}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email" 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Mật khẩu</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu" 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
          />
        </div>
        <button type="submit" className="btn-login" style={{ border: 'none', cursor: 'pointer', padding: '12px', marginTop: '10px' }}>Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;