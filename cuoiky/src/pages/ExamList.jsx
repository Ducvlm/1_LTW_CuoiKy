import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await axiosClient.get('/exams');
        setExams(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const code = examCode.trim().toUpperCase();
    if (!code) {
      setError('Vui lòng nhập mã đề thi!');
      return;
    }
    setError('');
    navigate(`/exam-room/${code}`);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: 'bold' }}>Danh sách bài thi</h2>

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
          placeholder="Nhập mã đề thi (VD: JAVA01)..."
          value={examCode}
          onChange={(e) => setExamCode(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#4f46e5',
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
        <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '20px' }}>{error}</p>
      )}

      {loading ? (
        <p>Đang tải danh sách kỳ thi...</p>
      ) : exams.length === 0 ? (
        <p>Hiện chưa có kỳ thi nào trong hệ thống.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {exams.map((exam) => (
            <div
              key={exam._id}
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
                <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{exam.title}</h4>
                <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
                  Mã đề: <strong>{exam.examCode}</strong> | Môn:{' '}
                  <strong>{exam.subject?.name || '—'}</strong> | Thời gian:{' '}
                  <strong>{exam.duration} phút</strong> | Trạng thái:{' '}
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
                onClick={() => navigate(`/exam-room/${exam.examCode}`)}
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
                {exam.status === 'Đang mở' ? 'Vào thi ngay' : exam.status}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;