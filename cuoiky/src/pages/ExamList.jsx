import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const mockExams = [
  { id: 1, code: 'REACT01', title: 'Kiểm tra giữa kỳ Lập trình Web', duration: 60, status: 'Đang mở' },
  { id: 2, code: 'NODE02', title: 'Bài thi thực hành Backend Node.js', duration: 45, status: 'Đang mở' },
  { id: 3, code: 'DB03', title: 'Kiểm tra Cơ sở dữ liệu MongoDB', duration: 30, status: 'Đã đóng' },
];

const ExamList = () => {
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
  const handleJoinByCode = (e) => {
    e.preventDefault();
    const foundExam = mockExams.find(
      (ex) => ex.code.toUpperCase() === examCode.trim().toUpperCase()
    );

    if (!foundExam) {
      setError(' Mã đề không tồn tại. Vui lòng kiểm tra lại!');
      return;
    }
    if (foundExam.status !== 'Đang mở') {
      setError(' Kỳ thi này hiện chưa mở hoặc đã đóng!');
      return;
    }

    setError('');
    navigate('/exam-room');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Danh sách bài thi</h2>

      
      <form
        onSubmit={handleJoinByCode}
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <input
          type="text"
          placeholder="Nhập mã đề thi (VD: REACT01)..."
          value={examCode}
          onChange={(e) => setExamCode(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Vào phòng thi
        </button>
      </form>

      {error && (
        <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '20px' }}>
          {error}
        </p>
      )}

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {mockExams.map((exam) => (
          <div
            key={exam.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#fff',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>{exam.title}</h4>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
                Mã đề: <strong>{exam.code}</strong> | Thời gian: <strong>{exam.duration} phút</strong> | Trạng thái:{' '}
                <span
                  style={{
                    color: exam.status === 'Đang mở' ? '#198754' : '#dc3545',
                    fontWeight: 'bold',
                  }}
                >
                  {exam.status}
                </span>
              </p>
            </div>

            <button
              disabled={exam.status !== 'Đang mở'}
              onClick={() => navigate('/exam-room')}
              style={{
                padding: '10px 16px',
                background: exam.status === 'Đang mở' ? '#198754' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: exam.status === 'Đang mở' ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              {exam.status === 'Đang mở' ? 'Vào thi ngay' : 'Đã đóng'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamList;