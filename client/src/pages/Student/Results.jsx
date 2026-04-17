import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Home, 
  ChevronDown,
  ChevronUp,
  Award,
  Zap
} from 'lucide-react';
import { API_URL } from '../../config';

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/attempts/${attemptId}/report`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReport(data.attempt);
          setAnswers(data.answers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [attemptId]);

  if (loading) return <div className="app-container" style={{ textAlign: 'center', paddingTop: '10rem' }}><h2>Generating Report...</h2></div>;
  if (!report) return <div className="app-container"><h2>Report not found</h2></div>;

  const passed = report.score >= report.passing_score;

  return (
    <div className="app-container animate-fade" style={{ maxWidth: '800px', paddingBottom: '5rem' }}>
      {/* Hero Result */}
      <section className="section-stack" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ 
          width: '160px', height: '160px', borderRadius: '50%', 
          background: passed ? 'var(--bg-light)' : '#FEE2E2',
          border: `8px solid ${passed ? 'var(--primary)' : '#DC2626'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem', position: 'relative'
        }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: passed ? 'var(--primary)' : '#DC2626' }}>{Math.round(report.score)}%</h1>
          <div style={{ 
            position: 'absolute', bottom: '-10px', background: passed ? 'var(--primary)' : '#DC2626',
            color: 'white', padding: '0.4rem 1.2rem', borderRadius: '100px', fontSize: '0.8rem',
            fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em'
          }}>
            {passed ? 'Passed' : 'Failed'}
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{passed ? 'Congratulations!' : 'Keep Learning!'}</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
          You completed the <strong>{report.exam_title}</strong>. 
          {passed ? ' You have successfully cleared the assessment and shared your proficiency.' : ' You were close! Review your answers below to improve for the next attempt.'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-emerald" style={{ padding: '0.8rem 2rem' }} onClick={() => navigate('/student')}>
            <Home size={18} /> Dashboard
          </button>
          <button className="btn-secondary" style={{ padding: '0.8rem 2rem' }}>
            <Download size={18} /> Certificate
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
        <div className="card-clean" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passing Goal</p>
          <h3 style={{ color: 'var(--text-main)' }}>{report.passing_score}%</h3>
        </div>
        <div className="card-clean" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Taken</p>
          <h3 style={{ color: 'var(--text-main)' }}>14:20</h3>
        </div>
      </div>

      {/* Question Breakdown */}
      <section className="section-stack">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={24} style={{ color: 'var(--primary)' }} /> Question Review
        </h2>
        
        <div className="section-stack">
          {answers.map((ans, i) => (
            <div key={i} className="card-clean" style={{ padding: '0' }}>
              <div 
                style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpanded({...expanded, [i]: !expanded[i]})}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: ans.is_correct ? 'var(--bg-light)' : '#FEE2E2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: ans.is_correct ? 'var(--primary)' : '#DC2626'
                  }}>
                    {ans.is_correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </div>
                  <span style={{ fontWeight: '600' }}>{ans.text.substring(0, 60)}...</span>
                </div>
                {expanded[i] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expanded[i] && (
                <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid var(--border-color)', background: 'var(--surface-light)' }}>
                  <div style={{ paddingTop: '2rem' }} className="section-stack">
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Response</p>
                      <p style={{ fontSize: '1rem', color: ans.is_correct ? 'var(--primary)' : '#DC2626', fontWeight: '600' }}>{ans.student_answer || '(No attempt)'}</p>
                    </div>
                    {!ans.is_correct && (
                      <div>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Correct Answer</p>
                        <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>{ans.correct_answer}</p>
                      </div>
                    )}
                    {ans.explanation && (
                      <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{ans.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Results;

