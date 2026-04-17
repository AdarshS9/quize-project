import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, Info, User as UserIcon, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

const ResultDetail = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/results/${attemptId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setDetail(data);
      } catch (err) {
        addToast('Failed to load attempt details', 'error');
      }
    };
    fetchDetail();
  }, [attemptId]);

  if (!detail) return null;

  const passed = detail.score >= 40; // Default passing score

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
        <button 
          onClick={() => navigate('/admin/reports')} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', margin: '0 auto 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase' }}
        >
          <ChevronLeft size={16} /> Back to Reports
        </button>
        <h1>Candidate Transcript</h1>
        <p>In-depth analysis of the examination submission.</p>
      </header>

      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        <section className="card-clean" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                {passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{detail.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{detail.exam_title}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: '800', color: passed ? 'var(--primary)' : '#EF4444', margin: 0 }}>{detail.score}%</p>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Final Assessment Score</p>
            </div>
          </div>
        </section>

        <section className="section-stack">
          <h3 style={{ fontSize: '1.25rem' }}>Detailed Breakdown</h3>
          {detail.questions.map((q, idx) => {
            const isCorrect = q.student_answer === q.correct_answer;
            return (
              <div key={idx} className="card-clean" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Question {idx + 1}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: isCorrect ? 'var(--primary)' : '#EF4444', textTransform: 'uppercase' }}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', lineHeight: '1.6' }}>{q.text}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '1rem', background: isCorrect ? 'var(--bg-light)' : '#FEF2F2', borderRadius: '10px', fontSize: '0.9rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: '800', color: isCorrect ? 'var(--primary)' : '#EF4444', textTransform: 'uppercase' }}>Candidate Response</p>
                    <p style={{ margin: 0, fontWeight: '700' }}>{q.student_answer || 'No answer provided'}</p>
                  </div>
                  {!isCorrect && (
                    <div style={{ padding: '1rem', background: 'var(--bg-light)', borderRadius: '10px', fontSize: '0.9rem' }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Correct Solution</p>
                      <p style={{ margin: 0, fontWeight: '700' }}>{q.correct_answer}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default ResultDetail;

