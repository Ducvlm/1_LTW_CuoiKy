import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCheck,
  Timer,
  BarChart3,
  ShieldCheck,
  Library,
  KeyRound,
  FileCheck2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Library,
    title: 'Ngân hàng câu hỏi',
    desc: 'Giảng viên soạn và phân loại câu hỏi theo môn học và độ khó, dùng lại cho nhiều đề thi.',
  },
  {
    icon: Timer,
    title: 'Thi có giới hạn thời gian',
    desc: 'Mỗi lượt thi có thời lượng, thời điểm mở và đóng đề rõ ràng, đảm bảo công bằng cho mọi thí sinh.',
  },
  {
    icon: BarChart3,
    title: 'Chấm điểm tự động',
    desc: 'Hệ thống tính điểm ngay khi nộp bài, hỗ trợ câu hỏi một hoặc nhiều đáp án đúng.',
  },
  {
    icon: ShieldCheck,
    title: 'Phân quyền rõ ràng',
    desc: 'Ba vai trò quản trị viên, giảng viên và thí sinh, mỗi vai trò chỉ thấy đúng phần việc của mình.',
  },
];

const STEPS = [
  { icon: KeyRound, title: 'Đăng nhập', desc: 'Dùng tài khoản được cấp hoặc tự đăng ký tài khoản thí sinh.' },
  { icon: ClipboardCheck, title: 'Vào phòng thi', desc: 'Nhập mã đề do giảng viên cung cấp để bắt đầu làm bài.' },
  { icon: FileCheck2, title: 'Nộp bài & xem điểm', desc: 'Kết quả được tổng hợp ngay sau khi bạn hoàn thành.' },
];

const Home = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const destination = user ? { admin: '/admin', teacher: '/teacher', student: '/exams' }[user.role] || '/' : null;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/70 text-xs font-medium text-indigo-700">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Hệ thống thi trắc nghiệm trực tuyến
          </span>

          <h1 className="mt-6 text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Tổ chức thi trắc nghiệm
            <br className="hidden sm:block" /> chính xác, minh bạch và nhanh chóng
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            QuizMaster giúp giảng viên xây dựng đề thi từ ngân hàng câu hỏi và giúp thí sinh làm bài, nhận kết quả
            ngay trên một nền tảng duy nhất.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link
                to={destination}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition"
              >
                Vào khu vực của tôi
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition"
                >
                  Đăng nhập để bắt đầu
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center h-11 px-6 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                >
                  Tạo tài khoản thí sinh
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* TÍNH NĂNG */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Mọi thứ cần thiết cho một kỳ thi
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Từ soạn câu hỏi, tổ chức đề thi đến chấm điểm, tất cả nằm trong một quy trình thống nhất.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUY TRÌNH */}
      <section className="bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Bắt đầu chỉ với 3 bước</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;