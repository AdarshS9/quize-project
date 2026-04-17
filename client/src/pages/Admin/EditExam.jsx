import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  UploadCloud,
  Type,
  Layout,
  Code,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [examInfo, setExamInfo] = useState({
    title: '', description: '', subject: '', date: '',
    duration: 60, total_marks: 0, 
    start_time: '', end_time: ''
  });
  const [questions, setQuestions] = useState([]);
  const [qType, setQType] = useState(null);
  const [currentQ, setCurrentQ] = useState({ text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await apiFetch(`/api/exams/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Parse times from ISO strings back to HH:MM if needed
        const startTime = data.start_time?.split('T')[1]?.substring(0, 5) || '';
        const endTime = data.end_time?.split('T')[1]?.substring(0, 5) || '';
        
        setExamInfo({
          title: data.title,
          description: data.description || '',
          subject: data.subject || '',
          date: data.date || '',
          duration: data.duration,
          total_marks: data.total_marks,
          start_time: startTime,
          end_time: endTime
        });
        
        setQuestions(data.questions || []);
      } catch (err) {
        addToast('Failed to load exam data', 'error');
        navigate('/admin/exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleNextStep = () => {
    if (!examInfo.title || !examInfo.subject || !examInfo.date || !examInfo.start_time || !examInfo.end_time) {
      return addToast('Please fill in all scheduling details including times', 'error');
    }
    setStep(2);
  };

  const addQuestion = () => {
    if (!currentQ.text || !currentQ.correct_answer) return addToast('Please complete question details', 'error');
    const newQuestions = [...questions, { ...currentQ, type: qType }];
    setQuestions(newQuestions);
    
    const total = newQuestions.reduce((acc, q) => acc + parseInt(q.marks || 0), 0);
    setExamInfo({ ...examInfo, total_marks: total });
    
    addToast('Question added', 'success');
    // Rapid Add: Reset the form but keep the qType to allow adding multiple questions quickly
    setCurrentQ({ text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 });
  };

  const handleSave = async () => {
    if (questions.length === 0) return addToast('Please add at least one question', 'error');
    setIsSaving(true);

    const startTimeFull = `${examInfo.date}T${examInfo.start_time}`;
    const endTimeFull = `${examInfo.date}T${examInfo.end_time}`;
    const payload = { 
      ...examInfo, 
      duration: parseInt(examInfo.duration),
      total_marks: parseInt(examInfo.total_marks),
      start_time: startTimeFull, 
      end_time: endTimeFull,
      questions 
    };

    try {
      await apiFetch(`/api/exams/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      addToast('Exam updated successfully', 'success');
      navigate('/admin/exams');
    } catch (err) {
      addToast(err.message || 'Failed to update exam', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="app-container" style={{ textAlign: 'center', padding: '10rem' }}><p>Loading assessment...</p></div>;

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
        <button 
          onClick={() => step === 1 ? navigate('/admin/exams') : setStep(1)} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', margin: '0 auto 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase' }}
        >
          <ChevronLeft size={16} /> {step === 1 ? 'Back to Registry' : 'Edit Configuration'}
        </button>
        <h1 style={{ fontSize: '2.5rem' }}>{step === 1 ? 'Modify Assessment' : 'Refine Question Bank'}</h1>
        <p>Ensure your examination remains accurate and challenging.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <div style={{ width: '40px', height: '6px', borderRadius: '100px', background: 'var(--primary)' }} />
          <div style={{ width: '40px', height: '6px', borderRadius: '100px', background: step === 2 ? 'var(--primary)' : 'var(--bg-light)', transition: '0.3s' }} />
        </div>
      </header>

      {step === 1 ? (
        <main className="section-stack" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="card-clean section-stack">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>General Settings</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Exam Title</label>
                <input 
                  className="input-clean" 
                  value={examInfo.title}
                  onChange={e => setExamInfo({...examInfo, title: e.target.value})}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Subject</label>
                <input 
                  className="input-clean" 
                  value={examInfo.subject}
                  onChange={e => setExamInfo({...examInfo, subject: e.target.value})}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Exam Date</label>
                <input 
                  type="date"
                  className="input-clean" 
                  value={examInfo.date}
                  onChange={e => setExamInfo({...examInfo, date: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Start Time</label>
                <input 
                  type="time" className="input-clean" 
                  value={examInfo.start_time}
                  onChange={e => setExamInfo({...examInfo, start_time: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>End Time</label>
                <input 
                  type="time" className="input-clean" 
                  value={examInfo.end_time}
                  onChange={e => setExamInfo({...examInfo, end_time: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Duration (min)</label>
                <input 
                  type="number" className="input-clean" 
                  value={examInfo.duration}
                  onChange={e => setExamInfo({...examInfo, duration: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Description</label>
              <textarea 
                className="input-clean" 
                style={{ height: '80px' }}
                value={examInfo.description}
                onChange={e => setExamInfo({...examInfo, description: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-light)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Updated Total Marks:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{examInfo.total_marks}</span>
            </div>
          </div>

          <button className="btn-emerald" style={{ width: '100%', padding: '1.25rem' }} onClick={handleNextStep}>
            Manage Questions <ArrowRight size={18} />
          </button>
        </main>
      ) : (
        <main className="section-stack" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-clean section-stack">
            {!qType ? (
              <div className="section-stack">
                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Add New Question</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {[
                    { id: 'MCQ', icon: Layout, label: 'Multiple Choice' },
                    { id: 'SHORT_ANSWER', icon: Type, label: 'Written' },
                    { id: 'CODING', icon: Code, label: 'Algorithmic' },
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setQType(t.id)}
                      className="card-clean"
                      style={{ border: '2px solid transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2.5rem 1.5rem' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <t.icon size={36} color="var(--primary)" />
                      <span style={{ fontWeight: '700' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="section-stack">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'var(--bg-light)', color: 'var(--primary)', fontWeight: '800' }}>New {qType}</span>
                  <button onClick={() => setQType(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                </div>
                
                <textarea 
                  className="input-clean" 
                  style={{ height: '140px' }}
                  placeholder="Question text..."
                  value={currentQ.text}
                  onChange={e => setCurrentQ({...currentQ, text: e.target.value})}
                />

                {qType === 'MCQ' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {currentQ.options.map((opt, i) => (
                      <input 
                        key={i} className="input-clean"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={e => {
                          const opts = [...currentQ.options];
                          opts[i] = e.target.value;
                          setCurrentQ({...currentQ, options: opts});
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <input 
                    className="input-clean" 
                    placeholder="Correct Answer..."
                    value={currentQ.correct_answer}
                    onChange={e => setCurrentQ({...currentQ, correct_answer: e.target.value})}
                  />
                  <input 
                    type="number" className="input-clean" 
                    value={currentQ.marks}
                    onChange={e => setCurrentQ({...currentQ, marks: e.target.value})}
                  />
                </div>

                <button className="btn-emerald" onClick={addQuestion}>
                  <Plus size={18} /> Add Question
                </button>
              </div>
            )}
          </div>

          <div className="section-stack" style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Active Questions ({questions.length})</h2>
              <button 
                className="btn-emerald" 
                onClick={handleSave} 
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? 'Saving Changes...' : 'Save & Exit'}
              </button>
            </div>
            
            <div className="section-stack">
              {questions.map((q, idx) => (
                <div key={idx} className="card-clean list-row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '24px', fontWeight: '800' }}>{idx + 1}.</div>
                    <div>
                      <p style={{ fontWeight: '600' }}>{q.text.substring(0, 100)}...</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800' }}>{q.type} • {q.marks} pts</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default EditExam;
