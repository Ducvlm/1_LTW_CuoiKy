import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const ExamRoom = () => {
  const { examCode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // 1. Gọi API vào phòng thi & tính đồng hồ theo giờ Server
  useEffect(() => {
    const initExam = async () => {
      try {
        const data = await axiosClient.post('/exams/join', { examCode });
        setAttemptId(data.attemptId);
        setExamInfo(data.exam);

        // 
        const examKey = `de_thi_${data.attemptId}`;
        const draftKey = `nhap_${data.attemptId}`;

        const savedOrder = localStorage.getItem(examKey);
        if (savedOrder) {
          setQuestions(JSON.parse(savedOrder));
        } else {
          const shuffled = shuffleArray(data.questions).map((q) => ({
            ...q,
            options: shuffleArray(q.options),
          }));
          localStorage.setItem(examKey, JSON.stringify(shuffled));
          setQuestions(shuffled);
        }

        const savedAnswers = localStorage.getItem(draftKey);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

        // 
        const startMs = new Date(data.startTime).getTime();
        const serverMs = new Date(data.serverTime).getTime();
        const endByDuration = startMs + data.exam.duration * 60 * 1000;
        const endByClose = new Date(data.exam.closeTime).getTime();
        const remainingSec = Math.max(0, Math.floor((Math.min(endByDuration, endByClose) - serverMs) / 1000));
        setTimeLeft(remainingSec);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examCode]);

  // 2. Lưu nháp vào localStorage mỗi khi chọn đáp án
  useEffect(() => {
    if (attemptId && !isSubmitted) {
      localStorage.setItem(`nhap_${attemptId}`, JSON.stringify(answers));
    }
  }, [answers, attemptId, isSubmitted]);

  // 3. Gửi bài lên Server chấm điểm
  const handleSubmit = useCallback(
    async (isAuto = false) => {
      if (!attemptId || isSubmitted) return;
      if (!isAuto) {
        const ok = window.confirm('Bạn có chắc chắn muốn nộp bài không?');
        if (!ok) return;
      }

      try {
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptions]) => ({
          questionId,
          selectedOptions,
        }));

        const res = await axiosClient.post('/exams/submit', {
          attemptId,
          answers: formattedAnswers,
        });

        setResult(res);
        setIsSubmitted(true);
        localStorage.removeItem(`nhap_${attemptId}`);
        localStorage.removeItem(`de_thi_${attemptId}`);
      } catch (err) {
        alert(err.message);
      }
    },
    [attemptId, answers, isSubmitted]
  );

  // 4. Đồng hồ đếm ngược & tự động nộp khi hết giờ
  useEffect(() => {
    if (loading || error || isSubmitted || !attemptId) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, error, isSubmitted, attemptId, handleSubmit]);

  // 5. Cảnh báo rời tab thi
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted && attemptId) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          alert(`⚠️ CẢNH BÁO: Bạn vừa rời khỏi trang thi! (Số lần vi phạm: ${newCount})`);
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted, attemptId]);

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSelectOption = (question, option) => {
    setAnswers((prev) => {
      const current = prev[question._id] || [];
      if (question.isMultipleChoice) {
        const exists = current.includes(option);
        const updated = exists ? current.filter((o) => o !== option) : [...current, option];
        return { ...prev, [question._id]: updated };
      }
      return { ...prev, [question._id]: [option] };
    });
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải đề thi...</div>;

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ color: '#dc3545', marginBottom: '12px' }}>Không thể vào phòng thi</h3>
        <p style={{ marginBottom: '20px' }}>{error}</p>
        <button onClick={() => navigate('/exams')} style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ color: '#198754', fontSize: '24px', fontWeight: 'bold' }}>Nộp bài thành công!</h2>
        <p style={{ marginTop: '12px', fontSize: '18px' }}>
          Điểm số: <strong style={{ color: '#4f46e5' }}>{result.score} / 10</strong>
        </p>
        <p style={{ marginTop: '8px' }}>
          Số câu đúng: <strong>{result.correctCount} / {result.totalQuestions}</strong>
        </p>
        {tabSwitchCount > 0 && (
          <p style={{ marginTop: '8px', color: '#dc3545', fontSize: '14px' }}>
            Số lần chuyển tab: {tabSwitchCount}
          </p>
        )}
        <button
          onClick={() => navigate('/exams')}
          style={{ marginTop: '24px', padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Về danh sách bài thi
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const selectedList = answers[currentQuestion._id] || [];

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ flex: 3, border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#fff' }}>
        <div style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
          {examInfo?.title} ({examInfo?.examCode})
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '18px' }}>
            Câu {currentIndex + 1}: {currentQuestion.content}
            {currentQuestion.isMultipleChoice && (
              <span style={{ fontSize: '13px', color: '#4f46e5', marginLeft: '8px' }}>(Chọn nhiều đáp án)</span>
            )}
          </h3>
          <button
            onClick={() => toggleFlag(currentQuestion._id)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #ffc107',
              background: flagged[currentQuestion._id] ? '#ffc107' : '#fff',
              fontWeight: 'bold',
            }}
          >
            🔖
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedList.includes(opt);
            return (
              <label
                key={idx}
                style={{
                  padding: '12px',
                  border: isSelected ? '2px solid #4f46e5' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isSelected ? '#eef2ff' : 'white',
                }}
              >
                <input
                  type={currentQuestion.isMultipleChoice ? 'checkbox' : 'radio'}
                  name={`question-${currentQuestion._id}`}
                  checked={isSelected}
                  onChange={() => handleSelectOption(currentQuestion, opt)}
                  style={{ marginRight: '10px' }}
                />
                {opt}
              </label>
            );
          })}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '6px' }}
          >
            &laquo; Câu trước
          </button>
          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '6px' }}
          >
            Câu sau &raquo;
          </button>
        </div>
      </div>

      <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#fff' }}>
        <h2 style={{ color: '#dc3545', margin: '0 0 20px 0', fontSize: '26px', fontWeight: 'bold' }}>
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </h2>
        <hr />
        <h4 style={{ margin: '15px 0' }}>Bảng điều hướng</h4>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {questions.map((q, index) => {
            const hasAnswered = (answers[q._id] || []).length > 0;
            const isCurrent = currentIndex === index;
            const isFlagged = flagged[q._id];
            return (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  border: isCurrent ? '2px solid #000' : '1px solid #ccc',
                  background: isFlagged ? '#ffc107' : hasAnswered ? '#198754' : '#fff',
                  color: isFlagged ? '#000' : hasAnswered ? '#fff' : '#000',
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleSubmit(false)}
          style={{ marginTop: '30px', width: '100%', padding: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          NỘP BÀI
        </button>
      </div>
    </div>
  );
};

export default ExamRoom;