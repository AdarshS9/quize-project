import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Terminal,
  Save,
  Award,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';

const ExamView = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [examState, setExamState] = useState('LOADING'); // LOADING, INSTRUCTIONS, ACTIVE
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await apiFetch(`/api/exams/${examId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setExamDetails(data);
        setExamState('INSTRUCTIONS');
      } catch (err) {
        addToast(err.message || 'Failed to load assessment details', 'error');
        navigate('/student');
      }
    };
    fetchExam();
  }, [examId, navigate, addToast]);

  const startExam = async () => {
    try {
      setExamState('LOADING');
      const data = await apiFetch(`/api/student/exams/${examId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      setTimeLeft(data.timeLeft);
      setExamState('ACTIVE');
      addToast('Examination started. Good luck!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to start exam', 'error');
      setExamState('INSTRUCTIONS');
    }
  };

  useEffect(() => {
    let timer;
    if (examState === 'ACTIVE' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && examState === 'ACTIVE') {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, examState]);

  const saveAnswer = async (qId, ans) => {
    setIsSaving(true);
    try {
      await apiFetch(`/api/student/attempts/${attemptId}/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ questionId: qId, studentAnswer: ans })
      });
    } catch (err) {
      console.error('Save failed:', err.message);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm('Submit your examination now?')) return;
    try {
      const data = await apiFetch(`/api/student/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      addToast('Examination submitted successfully', 'success');
      navigate(`/student/results/${attemptId}`);
    } catch (err) {
      addToast(err.message || 'Submission failed', 'error');
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (examState === 'LOADING') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-fade" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: '600' }}>Preparing environment...</p>
      </div>
    </div>
  );

  if (examState === 'INSTRUCTIONS') return (
    <div className="app-container animate-fade" style={{ maxWidth: '600px', paddingTop: '5rem' }}>
      <div className="card-clean section-stack">
        <div style={{ width: '60px', height: '60px', background: 'var(--bg-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--primary)' }}>
          <Award size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', textAlign: 'center' }}>{examDetails?.title}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{examDetails?.duration} minutes • Multiple Sections</p>
        
        <div style={{ background: '#FFF7ED', padding: '1.5rem', borderRadius: '12px', border: '1px solid #FFEDD5', display: 'flex', gap: '1rem' }}>
          <AlertCircle size={20} color="#EA580C" />
          <p style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: '500' }}>
            Do not refresh or switch tabs. The exam will auto-submit when the timer ends.
          </p>
        </div>

        <button className="btn-emerald" style={{ width: '100%', padding: '1.25rem' }} onClick={startExam}>
          Start Assessment
        </button>
      </div>
    </div>
  );

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div style={{ background: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header style={{ 
        padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{examDetails?.title}</h4>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isSaving && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>Saving...</span>}
          <div style={{ 
            padding: '0.5rem 1.25rem', background: timeLeft < 300 ? '#FEE2E2' : 'var(--bg-light)', 
            borderRadius: '100px', color: timeLeft < 300 ? '#DC2626' : 'var(--primary)',
            fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
          <button className="btn-emerald" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }} onClick={() => handleSubmit()}>Finish</button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div style={{ height: '3px', background: 'var(--bg-light)', width: '100%' }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${((currentQ + 1) / questions.length) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Question Content */}
      <main style={{ flex: 1, padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }} className="animate-fade">
        <div className="section-stack">
          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {currentQ + 1} of {questions.length}
          </p>
          <h2 style={{ fontSize: '2rem', lineHeight: '1.4', fontWeight: '700', color: 'var(--text-main)' }}>{q.text}</h2>

          <div style={{ marginTop: '3rem' }}>
            {q.type === 'MCQ' && (
              <div className="section-stack">
                {JSON.parse(q.options || '[]').map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => { setAnswers({...answers, [q.id]: opt}); saveAnswer(q.id, opt); }}
                    style={{ 
                      width: '100%', textAlign: 'left', padding: '1.5rem', 
                      borderRadius: 'var(--radius)', border: '2px solid',
                      borderColor: answers[q.id] === opt ? 'var(--primary)' : 'var(--border-color)',
                      background: answers[q.id] === opt ? 'var(--bg-light)' : 'white',
                      cursor: 'pointer', transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', gap: '1.25rem'
                    }}
                  >
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      background: answers[q.id] === opt ? 'var(--primary)' : 'transparent',
                      color: answers[q.id] === opt ? 'white' : 'var(--primary)', fontWeight: '800'
                    }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {q.type === 'SHORT_ANSWER' && (
              <textarea 
                className="input-clean" 
                style={{ height: '220px', fontSize: '1.25rem', padding: '2rem', lineHeight: '1.6' }}
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={e => { setAnswers({...answers, [q.id]: e.target.value}); saveAnswer(q.id, e.target.value); }}
              />
            )}

            {q.type === 'CODING' && (
              <div className="section-stack" style={{ background: '#0B1410', borderRadius: 'var(--radius)', padding: '1.5rem', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', fontFamily: 'monospace' }}>solution.js</span>
                </div>
                <textarea 
                  style={{ 
                    width: '100%', height: '350px', background: 'transparent', border: 'none', 
                    color: '#D1FAE5', fontFamily: '"Fira Code", monospace', outline: 'none', resize: 'none',
                    fontSize: '1rem', lineHeight: '1.7'
                  }}
                  placeholder="// Implement your solution..."
                  value={answers[q.id] || ''}
                  spellCheck="false"
                  onChange={e => { setAnswers({...answers, [q.id]: e.target.value}); saveAnswer(q.id, e.target.value); }}
                />
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Run Tests</button>
                    <button style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Console</button>
                  </div>
                  <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Terminal size={14} /> Ready
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Horizontal Strip Palette */}
      <footer style={{ 
        padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', 
        background: 'white', position: 'sticky', bottom: 0
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          <button 
            className="btn-secondary" 
            style={{ opacity: currentQ === 0 ? 0.3 : 1, width: '140px' }}
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(prev => prev - 1)}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem', flex: 1, justifyContent: 'center' }}>
            {questions.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentQ(idx)}
                style={{ 
                  minWidth: '36px', height: '36px', borderRadius: '50%', 
                  border: '2px solid', 
                  borderColor: currentQ === idx ? 'var(--primary)' : 'transparent',
                  background: answers[item.id] ? 'var(--primary)' : 'var(--bg-light)',
                  color: answers[item.id] ? 'white' : 'var(--text-muted)',
                  fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s',
                  fontSize: '0.75rem'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button 
            className="btn-emerald" 
            style={{ width: '140px' }}
            onClick={() => currentQ === questions.length - 1 ? handleSubmit() : setCurrentQ(prev => prev + 1)}
          >
            {currentQ === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={18} />
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ExamView;

