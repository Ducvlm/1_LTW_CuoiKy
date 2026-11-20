import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' // Mặc định là thí sinh
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Lắng nghe thay đổi dữ liệu trên input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Xử lý khi bấm nút Đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // 1. Kiểm tra định dạng Email bằng Regex trực tiếp trước khi gửi
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Định dạng email không hợp lệ (ví dụ: example@gmail.com)!');
      return; // Dừng lại, không gọi API
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại!');
      }

      setMessage('Đăng ký tài khoản thành công! Bạn có thể chuyển sang trang đăng nhập.');
      // Reset form sau khi đăng ký thành công
      setFormData({ username: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="welcome-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Đăng ký tài khoản</h2>
      <p style={{ margin: '15px 0', color: '#6b7280' }}>Tạo tài khoản mới để tham gia thi trắc nghiệm.</p>

      {/* Hiển thị thông báo lỗi hoặc thành công */}
      {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '10px', fontSize: '14px' }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Họ và tên</label>
          <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nhập họ tên của bạn" 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
          />
        </div>
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
        <button type="submit" className="btn-login" style={{ border: 'none', cursor: 'pointer', padding: '12px', marginTop: '10px' }}>Đăng ký ngay</button>
      </form>
    </div>
  );
};

export default Register;