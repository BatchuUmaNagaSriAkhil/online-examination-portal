import React, { useState, useEffect, useRef } from 'react';

const TakeExam = () => {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null); // Tracks seconds remaining
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const submitTriggeredRef = useRef(false); // Prevents duplicate network requests on timeout loop fire

  const studentEmail = localStorage.getItem('userEmail') || '';
  const searchParams = new URLSearchParams(window.location.search);
  const examId = searchParams.get('id');

  useEffect(() => {
    if (!examId) return;

    fetch(`http://localhost:5000/api/exams/${examId}`)
      .then(res => res.json())
      .then(data => {
        setExam(data);
        // Initialize remaining seconds based on database configuration (fallback to 60 min)
        setTimeLeft((data.duration || 60) * 60);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error reading exam schema metrics:", err);
        setLoading(false);
      });
  }, [examId]);

  // Handle the live counting down processing thread loop
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleSelectOption = (questionIndex, optionLetter) => {
    setAnswers({ ...answers, [questionIndex]: optionLetter });
  };

  const processFormPayloadSubmission = async (finalAnswers) => {
    if (submitTriggeredRef.current) return;
    submitTriggeredRef.current = true;
    setSubmitted(true);

    try {
      const response = await fetch('http://localhost:5000/api/student/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentEmail,
          examId: exam._id,
          examTitle: exam.title,
          studentAnswers: finalAnswers,
          questionsSnapshot: exam.questions
        })
      });
      if (response.ok) {
        alert("📊 Assessment completed! Your responses have been captured cleanly into history logs.");
        window.location.href = '/student-dashboard';
      }
    } catch (err) {
      console.error("Submission pipeline error:", err);
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (window.confirm("Are you sure you want to finish and submit your exam choices?")) {
      processFormPayloadSubmission(answers);
    }
  };

  const handleAutoSubmit = () => {
    alert("⏰ Time Limit Expired! The portal is automatically executing clean log packaging protocols for your choices.");
    processFormPayloadSubmission(answers);
  };

  // Convert pure remaining seconds tracking state into digital format layout maps
  const formatTimerDisplay = () => {
    if (timeLeft === null) return "00:00";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (loading) return <div style={styles.msgBox}>🔄 Initializing Exam Session Vectors...</div>;
  if (!exam) return <div style={styles.msgBox}>⚠️ Examination Instance Reference Missing or Broken.</div>;

  return (
    <div style={styles.container}>
      {/* PERSISTENT FLOATING HEADER BAR CONTROLLER */}
      <div style={{...styles.timerBar, backgroundColor: timeLeft < 60 ? '#fee2e2' : '#ffffff'}}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>📝 Live Session: {exam.title}</h3>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: timeLeft < 60 ? '#dc2626' : '#1f2937' }}>
          ⏱️ Remaining: {formatTimerDisplay()}
        </div>
      </div>

      <form onSubmit={handleManualSubmit} style={styles.formLayout}>
        {exam.questions.map((q, idx) => (
          <div key={idx} style={styles.questionCard}>
            <p style={styles.qText}><strong>Question {idx + 1}:</strong> {q.text}</p>
            <div style={styles.optionsWrapper}>
              {['A', 'B', 'C', 'D'].map((letter) => {
                const isSelected = answers[idx] === letter;
                return (
                  <label key={letter} style={{
                    ...styles.optionLabel, 
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #d1d5db'
                  }}>
                    <input 
                      type="radio" 
                      name={`question-${idx}`} 
                      checked={isSelected}
                      onChange={() => handleSelectOption(idx, letter)}
                      style={{ marginRight: '10px' }} 
                    />
                    <strong>{letter}.</strong> {q[`option${letter}`]}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <button type="submit" style={styles.finishBtn}>
          🏁 Finalize and Submit Paper
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif', padding: '100px 20px 40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timerBar: { position: 'fixed', top: 0, left: 0, right: 0, height: '70px', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', zIndex: 1000 },
  formLayout: { width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '20px' },
  questionCard: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  qText: { margin: '0 0 16px 0', fontSize: '15px', color: '#1f2937' },
  optionsWrapper: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionLabel: { padding: '14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.15s', fontSize: '14px' },
  finishBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
  msgBox: { padding: '100px', textAlign: 'center', fontFamily: 'sans-serif', color: '#4b5563' }
};

export default TakeExam;
