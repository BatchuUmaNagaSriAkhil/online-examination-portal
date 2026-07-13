import React, { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [examsList, setExamsList] = useState([]); 
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedResultId, setExpandedResultId] = useState(null);
  
  const studentEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/student/exams').then(res => res.json()), 
      fetch(`http://localhost:5000/api/student/results?email=${studentEmail}`).then(res => res.json())
    ])
    .then(([examsData, resultsData]) => {
      setExamsList(Array.isArray(examsData) ? examsData : []);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to sync structural runtime states:", err);
      setLoading(false);
    });
  }, [studentEmail]);

  const toggleResultExpansion = (id) => {
    setExpandedResultId(expandedResultId === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) return <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>🔄 Syncing Dashboard Panels...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🎓 Student Dashboard</h2>
          <button onClick={handleLogout} style={styles.logoutBtn}>Log Out</button>
        </div>

        <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('exams')} style={{...styles.tab, borderBottom: activeTab === 'exams' ? '3px solid #2563eb' : 'none', fontWeight: activeTab === 'exams' ? 'bold' : 'normal'}}>✍️ Scheduled Exams</button>
          <button onClick={() => setActiveTab('results')} style={{...styles.tab, borderBottom: activeTab === 'results' ? '3px solid #2563eb' : 'none', fontWeight: activeTab === 'results' ? 'bold' : 'normal'}}>📊 My Scores & Reviews</button>
        </div>

        <hr style={styles.divider} />

        {activeTab === 'exams' ? (
          <div style={styles.list}>
            {examsList.length === 0 ? (
              <div style={styles.emptyBox}><p style={{ margin: 0, color: '#6b7280' }}>No scheduled testing slots have been declared by administration.</p></div>
            ) : (
              examsList.map((exam) => {
                if (!exam.startDate || !exam.endDate) return null;
                const start = new Date(exam.startDate);
                const end = new Date(exam.endDate);
                const isUpcoming = currentTime < start;
                const isExpired = currentTime > end;
                const isOpen = !isUpcoming && !isExpired;

                return (
                  <div key={exam._id} style={{
                    ...styles.itemCard, 
                    borderLeft: isOpen ? '5px solid #10b981' : isUpcoming ? '5px solid #f59e0b' : '5px solid #ef4444',
                    backgroundColor: isOpen ? '#ffffff' : '#f9fafb'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px 0', color: '#1f2937' }}>{exam.title}</h4>
                      <div style={{ fontSize: '12px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>📅 Opens: {start.toLocaleString()}</span>
                        <span>🛑 Closes: {end.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      {isOpen ? (
                        <button onClick={() => window.location.href = `/take-exam?id=${exam._id}`} style={styles.startBtn}>
                          Start Test
                        </button>
                      ) : isUpcoming ? (
                        <span style={{...styles.statusBadge, backgroundColor: '#fef3c7', color: '#d97706'}}>
                          🔒 Locked
                        </span>
                      ) : (
                        <span style={{...styles.statusBadge, backgroundColor: '#fee2e2', color: '#dc2626'}}>
                          ❌ Closed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div>
            {results.length === 0 ? (
              <div style={styles.emptyBox}><p style={{ margin: 0, color: '#6b7280' }}>You have not completed any exams yet.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={styles.th}>Exam Title</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => {
                      const isExpanded = expandedResultId === res._id;
                      return (
                        <React.Fragment key={res._id}>
                          <tr onClick={() => toggleResultExpansion(res._id)} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: isExpanded ? '#f9fafb' : '#fff' }}>
                            <td style={{ ...styles.td, color: '#2563eb', fontWeight: '500' }}>{res.examTitle} <span>{isExpanded ? '▲' : '▼'}</span></td>
                            <td style={{ ...styles.td, fontWeight: 'bold', color: '#16a34a' }}>{res.score}</td>
                            <td style={styles.td}>{new Date(res.dateCompleted).toLocaleDateString()}</td>
                          </tr>
                          {isExpanded && res.questionsSnapshot && (
                            <tr>
                              <td colSpan="3" style={{ padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  {res.questionsSnapshot.map((q, idx) => {
                                    const studentChoice = res.studentAnswers ? (res.studentAnswers[idx] || res.studentAnswers[String(idx)]) : null;
                                    const correctChoice = q.correct;
                                    const isCorrect = studentChoice === correctChoice;

                                    return (
                                      <div key={idx} style={{ padding: '14px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: isCorrect ? '4px solid #10b981' : '4px solid #ef4444' }}>
                                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '13px' }}>Question {idx + 1}: {q.text}</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                          <div style={{ color: isCorrect ? '#16a34a' : '#dc2626' }}>
                                            <strong>Your Answer:</strong> {studentChoice ? `[Option ${studentChoice}] ${q[`option${studentChoice}`] || ''}` : 'Unanswered'}
                                          </div>
                                          {!isCorrect && (
                                            <div style={{ color: '#16a34a' }}>
                                              <strong>Correct Option:</strong> [Option {correctChoice}] {q[`option${correctChoice}`]}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif', padding: '20px' },
  card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '700px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  tabContainer: { display: 'flex', gap: '20px' },
  tab: { padding: '10px 4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px' },
  divider: { border: '0', height: '1px', backgroundColor: '#e5e7eb', margin: '0 0 24px 0' },
  emptyBox: { backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', padding: '30px', borderRadius: '8px', textAlign: 'center' },
  logoutBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  itemCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' },
  startBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  statusBadge: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  th: { padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#4b5563' },
  td: { padding: '12px', color: '#374151' }
};

export default StudentDashboard;
