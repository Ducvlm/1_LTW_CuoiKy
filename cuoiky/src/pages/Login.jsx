import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await axiosClient.post('/auth/login', formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-7 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/20">
              <GraduationCap size={22} />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Đăng nhập hệ thống</h2>
            <p className="mt-1 text-sm text-slate-500">Nhập thông tin tài khoản QuizMaster của bạn</p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl shadow-sm shadow-indigo-600/20 transition cursor-pointer mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;