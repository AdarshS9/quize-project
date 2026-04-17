import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  Clock,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../../App';
import { apiFetch } from '../../utils/api';

const ExamItem = ({ exam, onEnter }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startTime = new Date(exam.start_time);
  const endTime = new Date(exam.end_time);
  const isUpcoming = now < startTime;
  const isLive = now >= startTime && now <= endTime;
  const isExpired = now > endTime;
  const isCompleted = exam.user_attempt_status === 'SUBMITTED';

  if (isCompleted) return null;

  const getStatusColor = () => {
    if (isLive) return { bg: '#D1FAE5', text: '#059669', label: 'Live' };
    if (isUpcoming) return { bg: '#DBEAFE', text: '#1E40AF', label: 'Upcoming' };
    return { bg: '#FEE2E2', text: '#991B1B', label: 'Expired' };
  };

  const status = getStatusColor();

  return (
    <div className="card-clean list-row" style={{ 
      justifyContent: 'space-between', 
      marginBottom: '1rem',
      borderLeft: `6px solid ${status.text}`,
      padding: '1.5rem',
      background: isLive ? 'rgba(16, 185, 129, 0.05)' : 'white'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <div style={{ 
          width: '50px', height: '50px', 
          background: isLive ? 'var(--primary-gradient)' : 'var(--bg-light)', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isLive ? 'white' : 'var(--primary)',
          position: 'relative'
        }}>
          <Clock size={24} />
          {isLive && <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', background: '#10B981', borderRadius: '50%', border: '2px solid white', animation: 'pulse 2s infinite' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '700' }}>{exam.title}</h3>
            <span className="badge" style={{ background: status.bg, color: status.text, fontWeight: '800', fontSize: '0.7rem' }}>
              {status.label}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '1.5rem', justifyContent: 'start' }}>
            <span><strong>Subject:</strong> {exam.subject || 'General'}</span>
            <span><strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}</span>
            <span><strong>Time:</strong> {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span><strong>Dur:</strong> {exam.duration}m</span>
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
         <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Total: {exam.total_marks || 0} Marks</p>
         {isLive ? (
          <button className="btn-emerald" onClick={() => onEnter(exam.id)} style={{ padding: '0.75rem 1.75rem' }}>
            Start Exam <Play size={16} />
          </button>
        ) : (
          <button disabled style={{ 
            background: 'var(--bg-light)', color: 'var(--text-muted)', border: 'none',
            padding: '0.75rem 1.75rem', borderRadius: 'var(--radius)', fontWeight: '700',
            cursor: 'not-allowed', fontSize: '0.85rem'
          }}>
            {isExpired ? 'Exam Finished' : `Starts ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </button>
        )}
      </div>
    </div>
  );
};

const ResultItem = ({ result }) => (
  <div className="list-row" style={{ justifyContent: 'space-between', padding: '1rem 0' }}>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
        <CheckCircle size={20} />
      </div>
      <div>
        <p style={{ fontWeight: '600', fontSize: '1rem' }}>{result.title}</p>
        <p style={{ fontSize: '0.8rem' }}>{new Date(result.submit_time).toLocaleDateString()}</p>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{result.score} pts</p>
      <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Completed</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        const allExams = await apiFetch('/api/exams', { headers });
        const dashData = await apiFetch('/api/student/dashboard', { headers });

        const today = new Date();
        today.setHours(0,0,0,0);
        
        const filtered = allExams.filter(e => {
           const examDate = new Date(e.date);
           examDate.setHours(0,0,0,0);
           return today <= examDate;
        });

        setExams(filtered);
        setHistory(dashData.history || []);
      } catch (err) {
        console.error('Dashboard sync error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s sync for real-time visibility
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ 
          width: '80px', height: '80px', background: 'var(--primary-gradient)', 
          borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', color: 'white', transform: 'rotate(-5deg)'
        }}>
          <Award size={40} />
        </div>
        <h1>Welcome, {user?.name}</h1>
        <p>Ready to validate your skills today?</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="card-clean" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Avg Performance</p>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>88%</h2>
          </div>
        </div>
        <div className="card-clean" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Assessments</p>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{history.length}</h2>
          </div>
        </div>
        <div className="card-clean" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Global Rank</p>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>#12</h2>
          </div>
        </div>
      </div>

      <section className="section-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Upcoming Assessments</h2>
          <button style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>View All</button>
        </div>
        <div className="section-stack">
          {exams.length > 0 ? (
            exams.map(e => <ExamItem key={e.id} exam={e} onEnter={(id) => navigate(`/student/exam/${id}`)} />)
          ) : (
            <div className="card-clean" style={{ textAlign: 'center', opacity: 0.6 }}>No exams available right now.</div>
          )}
        </div>
      </section>

      <section className="section-stack">
        <h2>Recent Performance</h2>
        <div className="card-clean" style={{ padding: '0 2rem' }}>
          {history.length > 0 ? (
            history.map((h, i) => <ResultItem key={i} result={h} />)
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>You haven't taken any exams yet.</div>
          )}
        </div>
      </section>

      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          View Full Report <ArrowRight size={18} />
        </button>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
