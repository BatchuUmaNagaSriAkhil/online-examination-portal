import React, { useState, useEffect } from 'react';

const ExamEnvironment = () => {
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    { id: 1, text: "Which data structure operates on a Last-In-First-Out (LIFO) basis?", options: ["Queue", "Array", "Stack", "Linked List"] },
    { id: 2, text: "What does SQL stand for?", options: ["Structured Query Language", "Strong Question Language", "Sequential Query List", "None of the above"] }
  ];

  useEffect(() => {
  if (timeLeft <= 0) return;

  const timer = setTimeout(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (option) => {
  setAnswers((prev) => ({
    ...prev,
    [currentQuestion]: option,
  }));
};

  const handleSubmitExam = () => {
    console.log("Submitting answers to backend:", answers);
    alert("Exam submitted successfully!");
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3>Navigation</h3>
        <div style={styles.navGrid}>
          {questions.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentQuestion(index)}
              style={{...styles.navBtn, backgroundColor: currentQuestion === index ? '#2563eb' : '#e5e7eb', color: currentQuestion === index ? '#fff' : '#000'}}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button onClick={handleSubmitExam} style={styles.submitBtn}>Finish & Submit</button>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.timerHeader}>
          <h2>Live Exam Session</h2>
          <span style={styles.timer}>⏱ Time Remaining: {formatTime(timeLeft)}</span>
        </div>

        <div style={styles.questionCard}>
          <h3>Question {currentQuestion + 1}</h3>
          <p style={styles.questionText}>{questions[currentQuestion].text}</p>
          <div style={styles.optionsList}>
            {questions[currentQuestion].options.map((option, idx) => (
              <label key={idx} style={styles.optionLabel}>
                <input 
                  type="radio" 
                  name={`question-${currentQuestion}`} 
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleOptionSelect(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#1f2937', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  navGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  navBtn: { padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { marginTop: 'auto', backgroundColor: '#ef4444', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  mainContent: { flex: 1, padding: '40px', backgroundColor: '#f3f4f6' },
  timerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  timer: { fontSize: '18px', fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fee2e2', padding: '8px 16px', borderRadius: '20px' },
  questionCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  questionText: { fontSize: '18px', marginBottom: '20px', color: '#374151' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  optionLabel: { display: 'flex', gap: '10px', alignItems: 'center', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }
};

export default ExamEnvironment;
