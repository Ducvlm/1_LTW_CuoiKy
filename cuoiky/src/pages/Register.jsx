import React from 'react';

const Register = () => {
  return (
    <div className="welcome-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Đăng ký tài khoản</h2>
      <p style={{ margin: '15px 0', color: '#6b7280' }}>Tạo tài khoản mới để tham gia thi trắc nghiệm.</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Họ và tên</label>
          <input type="text" placeholder="Nhập họ tên của bạn" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input type="email" placeholder="Nhập email" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Mật khẩu</label>
          <input type="password" placeholder="Nhập mật khẩu" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        </div>
        <button type="submit" className="btn-login" style={{ border: 'none', cursor: 'pointer', padding: '12px', marginTop: '10px' }}>Đăng ký ngay</button>
      </form>
    </div>
  );
};

export default Register;