import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, TrendingUp, Calendar, Trophy, Download, ChevronRight, FileText } from 'lucide-react';
import { API_URL } from '../../config';

const AttemptCard = ({ attempt, onReview }) => {
  const passed = attempt.score >= 40; // Assuming 40 is pass
  
  return (
    <div className="card-clean list-row" style={{ justifyContent: 'space-between', padding: '1.5rem 2rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          width: '48px', height: '48px', background: 'var(--bg-light)', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: passed ? 'var(--primary)' : '#EF4444'
        }}>
          <FileText size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{attempt.title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Submitted: {new Date(attempt.submit_time || attempt.start_time).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: passed ? 'var(--primary)' : '#EF4444', margin: 0 }}>{attempt.score}%</p>
          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Result</p>
        </div>
        <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => onReview(attempt.id)}>
          Review <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const StudentHistory = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/dashboard`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const avgScore = history.length > 0 ? (history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length).toFixed(1) : 0;

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Attempt History</h1>
          <p>Trace your academic growth and exam milestones.</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/student/exams')}>
          Browse Exams
        </button>
      </header>

      <section className="section-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
        <div className="card-clean" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Global Average</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{avgScore}%</h2>
          </div>
        </div>
        <div className="card-clean" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Attempts</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{history.length}</h2>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '2.5rem' }}>
        <section className="section-stack">
          {history.length > 0 ? (
            history.map((attempt) => (
              <AttemptCard 
                key={attempt.id} 
                attempt={attempt} 
                onReview={(id) => navigate(`/student/results/${id}`)}
              />
            ))
          ) : (
            <div className="card-clean" style={{ textAlign: 'center', padding: '4rem' }}>
              <HistoryIcon size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
              <p style={{ color: 'var(--text-muted)' }}>No exam attempts recorded yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentHistory;

