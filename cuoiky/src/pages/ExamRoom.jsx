import React, { useState, useEffect } from 'react';

//  Dữ liệu giả lập để làm giao diện trước khi có API
const mockQuestions = [
  { id: 1, text: "React được phát triển bởi công ty nào?", options: ["Google", "Facebook", "Microsoft", "Apple"] },
  { id: 2, text: "Hook nào dùng để quản lý state cơ bản nhất?", options: ["useEffect", "useContext", "useState", "useReducer"] },
  { id: 3, text: "Để chuyển trang trong React Router v6, ta dùng hook nào?", options: ["useHistory", "useNavigate", "useRouter", "useTransition"] },
  { id: 4, text: "React được phát triển bởi công ty nào?", options: ["Google", "Facebook", "Microsoft", "Apple"] },
  { id: 5, text: "Hook nào dùng để quản lý state cơ bản nhất?", options: ["useEffect", "useContext", "useState", "useReducer"] },
  { id: 6, text: "Để chuyển trang trong React Router v6, ta dùng hook nào?", options: ["useHistory", "useNavigate", "useRouter", "useTransition"] },
  { id: 7, text: "Để chuyển trang trong React Router v6, ta dùng hook nào?", options: ["useHistory", "useNavigate", "useRouter", "useTransition"] },
];

const ExamRoom = () => {
  const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const [flagged, setFlagged] = useState({});

const toggleFlag = (questionId) => {
  setFlagged((prev) => ({
    ...prev,
    [questionId]: !prev[questionId],
  }));
};

const [questions, setQuestions] = useState(() => {
    const savedExam = localStorage.getItem('de_thi_da_tron');
    if (savedExam) return JSON.parse(savedExam);

    const shuffled = shuffleArray(mockQuestions).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    localStorage.setItem('de_thi_da_tron', JSON.stringify(shuffled));
    return shuffled;
  });
 
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('thoi_gian_thi');
    return savedTime ? Number(savedTime) : 3600;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  
  const [answers, setAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem('nhap_bai_thi');
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  useEffect(() => {
    localStorage.setItem('nhap_bai_thi', JSON.stringify(answers));
  }, [answers]);

  
  useEffect(() => {
    localStorage.setItem('thoi_gian_thi', timeLeft);
  }, [timeLeft]);
  
const [isSubmitted, setIsSubmitted] = useState(false);
const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted]);

  useEffect(() => {
  const handleVisibilityChange = () => {
    
    if (document.hidden && !isSubmitted) {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        alert(`⚠️ CẢNH BÁO: Bạn vừa rời khỏi trang thi! (Số lần vi phạm: ${newCount})`);
        return newCount;
      });
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [isSubmitted]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

 
  const currentQuestion = questions[currentIndex];

  
  const handleSelectAnswer = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
  };

  const handleSubmit = (isAuto = false) => {
    if (!isAuto) {
      const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài không?");
      if (!confirmSubmit) return;
    }

    setIsSubmitted(true);
    localStorage.removeItem('nhap_bai_thi');
    localStorage.removeItem('thoi_gian_thi');
    localStorage.removeItem('de_thi_da_tron');
    
  };



  if (isSubmitted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ color: '#198754' }}> Nộp bài thành công!</h2>
        <p>Bạn đã hoàn thành <strong>{Object.keys(answers).length} / {questions.length}</strong> câu hỏi.</p>
        <p style={{ color: '#666' }}>Kết quả chi tiết sẽ được cập nhật sau khi kết nối máy chủ.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      
      <div style={{ flex: 3, border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Câu {currentIndex + 1}: {currentQuestion.text}</h3>
          <button
            onClick={() => toggleFlag(currentQuestion.id)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #ffc107',
              background: flagged[currentQuestion.id] ? '#ffc107' : '#fff',
              color: '#000',
              fontWeight: 'bold',
            }}
          >
            {flagged[currentQuestion.id] ? '🔖' : '🔖'}               
          </button>
        </div>

        
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = answers[currentQuestion.id] === opt;
            return (
              <label 
                key={idx} 
                style={{ 
                  padding: '12px', 
                  border: isSelected ? '2px solid #0d6efd' : '1px solid #ddd', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  background: isSelected ? '#e9ecef' : 'white'
                }}
              >
                <input 
                  type="radio" 
                  name={`question-${currentQuestion.id}`} 
                  checked={isSelected}
                  onChange={() => handleSelectAnswer(opt)}
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
            onClick={() => setCurrentIndex(prev => prev - 1)}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            &laquo; Câu trước
          </button>
          
          <button 
            disabled={currentIndex === questions.length - 1} 
            onClick={() => setCurrentIndex(prev => prev + 1)}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Câu sau &raquo;
          </button>
        </div>
      </div>

      
      <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#dc3545', margin: '0 0 20px 0' }}>
           {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </h2>
        <hr />
        
        <h4 style={{ marginBottom: '15px' }}>Bảng điều hướng</h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {questions.map((q, index) => {
            const hasAnswered = answers[q.id]; 
            const isCurrent = currentIndex === index;
            const isFlagged = flagged[q.id]; 
            
            return (
              <button 
                key={q.id} 
                onClick={() => setCurrentIndex(index)}
                style={{ 
                  width: '40px', height: '40px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px',
                  border: isCurrent ? '2px solid #000' : '1px solid #ccc',
                  background: isFlagged ? '#ffc107' : hasAnswered ? '#198754':'#fff', 
                  color: isFlagged ? '#000' :  hasAnswered ? '#fff':'#000',
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