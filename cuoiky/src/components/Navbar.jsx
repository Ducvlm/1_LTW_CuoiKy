import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">
        ✍️ QuizMaster
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className="nav-item">Trang chủ</NavLink>
        <NavLink to="/exams" className="nav-item">Kỳ thi</NavLink>
        <NavLink to="/admin" className="nav-item">Quản trị</NavLink>
        <NavLink to="/login" className="nav-item">Đăng nhập</NavLink>
        <NavLink to="/register" className="nav-item btn-login">Đăng ký</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;