import React, { useState, useEffect } from 'react';

//  Dữ liệu giả lập để làm giao diện trước khi có API
const mockQuestions = [
  { id: 1, text: "React được phát triển bởi công ty nào?", options: ["Google", "Facebook", "Microsoft", "Apple"] },
  { id: 2, text: "Hook nào dùng để quản lý state cơ bản nhất?", options: ["useEffect", "useContext", "useState", "useReducer"] },
  { id: 3, text: "Để chuyển trang trong React Router v6, ta dùng hook nào?", options: ["useHistory", "useNavigate", "useRouter", "useTransition"] }
];

const ExamRoom = () => {
  const [timeLeft, setTimeLeft] = useState(3600);
  
  
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState({}); 

  
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

 
  const currentQuestion = mockQuestions[currentIndex];

  
  const handleSelectAnswer = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
  };

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      
      <div style={{ flex: 3, border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Câu {currentIndex + 1}: {currentQuestion.text}</h3>
        
        
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
            disabled={currentIndex === mockQuestions.length - 1} 
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
          {mockQuestions.map((q, index) => {
            const hasAnswered = answers[q.id]; 
            const isCurrent = currentIndex === index; 
            
            return (
              <button 
                key={q.id} 
                onClick={() => setCurrentIndex(index)}
                style={{ 
                  width: '40px', height: '40px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px',
                  border: isCurrent ? '2px solid #000' : '1px solid #ccc',
                  background: hasAnswered ? '#198754' : '#fff', 
                  color: hasAnswered ? '#fff' : '#000'
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        
        <button style={{ marginTop: '30px', width: '100%', padding: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          NỘP BÀI
        </button>
      </div>
      
    </div>
  );
};

export default ExamRoom;