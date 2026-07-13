import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import IndexPortal from '../index.jsx'; 
import AdminPanel from '../admin.jsx'; 
import StudentDashboard from '../student-dashboard.jsx'; 
import { staticExams } from './examsData'; 

const TakeExamRoom = ({ examId, navigateTo }) => {
  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState('');
  
  const [timeLeftString, setTimeLeftString] = useState('');
  const [isForceSubmitting, setIsForceSubmitting] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || '';
    setStudentEmail(storedEmail);

    if (examId && storedEmail) {
      fetch(`http://localhost:5000/api/student/check-attempt?email=${storedEmail}&examId=${examId}`)
        .then(res => {
          // SAFEGUARD: Check content headers before parsing JSON
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Backend server sent an HTML response instead of JSON. Ensure your server is active on Port 5000.");
          }
          return res.json();
        })
        .then(attemptCheck => {
          if (!attemptCheck.allowed) {
            alert(attemptCheck.error);
            navigateTo('/dashboard');
            return;
          }
          
          const localMatch = staticExams.find(item => item._id === examId);
          if (localMatch) {
            const now = new Date();
            const end = new Date(localMatch.endDate);

            if (localMatch.endDate && now > end) {
              alert("❌ This exam session has already reached its closing time limit.");
              navigateTo('/dashboard');
              return;
            }
            setExam(localMatch);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to check exam attempt eligibility:", err);
          alert("⚠️ Network Sync Error: Could not connect to API routes safely.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [examId, navigateTo]);

  useEffect(() => {
    if (!exam || !exam.endDate || isForceSubmitting) return;

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(exam.endDate).getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        clearInterval(timerInterval);
        setTimeLeftString("00:00:00 - Time's Up!");
        handleAutoForceSubmit(); 
      } else {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeftString(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [exam, isForceSubmitting, selectedAnswers]);

  const handleAutoForceSubmit = () => {
    setIsForceSubmitting(true);
    alert("⏰ The exam closing time has been reached! Submitting your work automatically.");
    executeSubmissionPayload();
  };

  const handleFinalSubmit = async () => {
    if (window.confirm("Are you sure you want to finalize and submit your test answers?")) {
      executeSubmissionPayload();
    }
  };

  const executeSubmissionPayload = async () => {
    if (!exam || !exam.questions) return;
    let correctCount = 0;
    exam.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correctCount++;
    });

    try {
      const res = await fetch('http://localhost:5000/api/student/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: studentEmail, 
          examId: exam._id, 
          examTitle: exam.title, 
          score: `${correctCount}/${exam.questions.length}`,
          studentAnswers: selectedAnswers,
          questionsSnapshot: exam.questions
        })
      });

      if (!res.ok) throw new Error("Submission network failure.");

      alert(`🏁 Exam Submitted Successfully!`);
      navigateTo('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Error logging exam metrics.");
    }
  };

  if (loading) return <div style={styles.centerBox}><h3>🔄 Loading Exam Room Specifications...</h3></div>;
  if (!exam) return <div style={styles.centerBox}><h3>⚠️ Invalid Exam reference mapping token.</h3></div>;

  return (
    <div style={styles.examContainer}>
      <div style={styles.examCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>📝 Test: {exam.title}</h2>
            <span style={styles.badge}>Q {currentIdx + 1} of {exam.questions.length}</span>
          </div>
          <div style={styles.timerBox}>
            <span style={{ fontSize: '11px', color: '#4b5563' }}>Closing Countdown</span>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#ef4444' }}>⏳ {timeLeftString || 'Computing...'}</div>
          </div>
        </div>
        <hr style={styles.divider} />
        <div>
          <p style={{ fontWeight: 'bold', color: '#1f2937' }}>{currentIdx + 1}. {exam.questions[currentIdx].text}</p>
          <div style={styles.optionsList}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optionText = exam.questions[currentIdx][`option${opt}`];
              if (!optionText) return null;
              return (
                <label key={opt} style={{ ...styles.optionItem, backgroundColor: selectedAnswers[currentIdx] === opt ? '#eff6ff' : '#fff', border: selectedAnswers[currentIdx] === opt ? '2px solid #2563eb' : '1px solid #d1d5db' }}>
                  <input type="radio" checked={selectedAnswers[currentIdx] === opt} onChange={() => setSelectedAnswers({ ...selectedAnswers, [currentIdx]: opt })} style={{ marginRight: '10px' }} />
                  <strong>{opt}.</strong> {optionText}
                </label>
              );
            })}
          </div>
        </div>
        <div style={styles.actionRow}>
          <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)} style={{ ...styles.navBtn, opacity: currentIdx === 0 ? 0.4 : 1 }}>◀ Back</button>
          {currentIdx < exam.questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} style={styles.navBtn}>Next ▶</button>
          ) : (
            <button onClick={handleFinalSubmit} style={styles.submitBtn}>Submit Exam 🏁</button>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [path, setPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (targetPath) => {
    window.history.pushState({}, '', targetPath);
    const [cleanPath, search] = targetPath.split('?');
    setPath(cleanPath);
    setSearchParams(new URLSearchParams(search || ''));
  };

  if (path === '/admin') return <AdminPanel navigateTo={navigateTo} />;
  if (path === '/dashboard') return <StudentDashboard navigateTo={navigateTo} />;
  if (path === '/take-exam') return <TakeExamRoom examId={searchParams.get('id')} navigateTo={navigateTo} />;
  return <IndexPortal navigateTo={navigateTo} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

const styles = {
  examContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111827', fontFamily: 'sans-serif', padding: '20px' },
  examCard: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '650px' },
  badge: { backgroundColor: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginTop: '5px' },
  timerBox: { backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '8px 14px', borderRadius: '8px', textAlign: 'right', minWidth: '150px' },
  divider: { border: '0', height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
  optionItem: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '6px', cursor: 'pointer' },
  actionRow: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' },
  navBtn: { backgroundColor: '#4b5563', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  centerBox: { padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }
};
