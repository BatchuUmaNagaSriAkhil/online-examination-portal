import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [stats, setStats] = useState({ examsConducted: 0, registeredStudents: 0 });
  const [examTitle, setExamTitle] = useState('');
  
  // Dynamic array of questions determined by the admin
  const [questions, setQuestions] = useState([
    { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }
  ]);
  
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('http://localhost:5000/api/admin/dashboard')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => { 
      // Fix: Fallback to default properties if data or data.stats is missing
      setStats(data?.stats || { examsConducted: 0, registeredStudents: 0 }); 
      setLoading(false); 
    })
    .catch((error) => {
      // Fix: Logs the error to F12 Console instead of silently crashing
      console.error("Dashboard Fetch Failed:", error); 
      setLoading(false);
    });
}, []);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addNewQuestionField = () => {
    setQuestions([...questions, { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }]);
  };

  const removeQuestionField = (index) => {
    if (questions.length === 1) return; // Always keep at least one question
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handlePublishExam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/create-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: examTitle, questions: questions })
      });
      
      if (response.ok) {
        alert(`🎉 Exam "${examTitle}" with ${questions.length} questions published successfully!`);
        setExamTitle('');
        setQuestions([{ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }]);
        
        // Refresh dashboard statistics counters
        const res = await fetch('http://localhost:5000/api/admin/dashboard');
        const data = await res.json();
        setStats(
          data?.stats || {
            examsConducted: 0,
            registeredStudents: 0,
          }
        );
      }
    } catch (err) { 
      alert("Error launching exam."); 
    }
  };

  if (loading) return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Loading Dashboard Metrics...</div>;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h3>Admin Console</h3>
        <p style={{color: '#9ca3af', fontSize: '13px'}}>Manage custom examination instances</p>
      </aside>
      
      <main style={styles.main}>
        <h2>Live System Metrics</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><h3>{stats.examsConducted}</h3><p>Exams Launched</p></div>
          <div style={styles.statCard}><h3>{stats.registeredStudents}</h3><p>Total Students</p></div>
        </div>

        <div style={styles.sectionCard}>
          <h3>Create Dynamic Exam Session</h3>
          <form onSubmit={handlePublishExam} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Exam Module Title</label>
              <input type="text" placeholder="e.g., Mid-Term Java Assessment" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} required style={styles.input}/>
            </div>

            <hr style={styles.divider} />
            <h4>Questions Content Packet ({questions.length} assigned)</h4>

            {questions.map((q, index) => (
              <div key={index} style={styles.questionBlock}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong style={{color: '#2563eb'}}>Question #{index + 1}</strong>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestionField(index)} style={styles.deleteBtn}>Delete Question</button>
                  )}
                </div>

                <textarea placeholder="Type Question Prompt here..." value={q.text} onChange={(e) => handleQuestionChange(index, 'text', e.target.value)} required style={styles.textarea}/>
                
                <div style={styles.optionsGrid}>
                  <input type="text" placeholder="Option A" value={q.optionA} onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)} required style={styles.input}/>
                  <input type="text" placeholder="Option B" value={q.optionB} onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)} required style={styles.input}/>
                  <input type="text" placeholder="Option C" value={q.optionC} onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)} required style={styles.input}/>
                  <input type="text" placeholder="Option D" value={q.optionD} onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)} required style={styles.input}/>
                </div>

                <div style={{marginTop: '10px'}}>
                  <label style={{fontSize: '13px', marginRight: '10px', fontWeight: 'bold'}}>Select Correct Choice Key: </label>
                  <select value={q.correct} onChange={(e) => handleQuestionChange(index, 'correct', e.target.value)} style={styles.select}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>
            ))}

            <button type="button" onClick={addNewQuestionField} style={styles.addBtn}>
              ➕ Add Question Field
            </button>

            <button type="submit" style={styles.submitBtn}>
              🚀 Publish Live Exam Session
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' },
  sidebar: { width: '240px', backgroundColor: '#111827', color: '#fff', padding: '24px' },
  main: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' },
  statsGrid: { display: 'flex', gap: '20px' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  sectionCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#4b5563' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '60px', fontSize: '14px', marginTop: '8px' },
  questionBlock: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '10px' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' },
  select: { padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db' },
  divider: { border: '0', height: '1px', backgroundColor: '#e5e7eb', margin: '15px 0' },
  addBtn: { backgroundColor: '#10b981', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', padding: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default AdminPanel;
