import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, HelpCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const ExamItem = ({ exam, onEnter }) => {
  const isCompleted = exam.user_attempt_status === 'SUBMITTED';
  
  return (
    <div className="card-clean list-row" style={{ justifyContent: 'space-between', padding: '1.5rem 2rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          width: '48px', height: '48px', background: 'var(--bg-light)', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          {isCompleted ? <CheckCircle size={24} /> : <BookOpen size={24} />}
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{exam.title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {exam.duration}m • {exam.question_count} Questions • {isCompleted ? 'Completed' : 'Available'}
          </p>
        </div>
      </div>
      <button 
        className={isCompleted ? 'btn-secondary' : 'btn-emerald'} 
        onClick={() => onEnter(exam.id)}
      >
        {isCompleted ? 'Review' : 'Start Exam'} <ChevronRight size={18} />
      </button>
    </div>
  );
};

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await apiFetch('/api/exams', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setExams(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const isCompleted = e.user_attempt_status === 'SUBMITTED';
    if (filter === 'COMPLETED') return matchesSearch && isCompleted;
    if (filter === 'PENDING') return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  return (
    <div className="app-container animate-fade">
      <header className="section-stack">
        <h1>Available Exams</h1>
        <p>Select an assessment to validate your knowledge.</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} style={{ pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="input-clean"
              style={{ paddingLeft: '3rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-light)', padding: '0.3rem', borderRadius: '12px' }}>
            {['ALL', 'PENDING', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ 
                  border: 'none', background: filter === f ? 'white' : 'transparent',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem',
                  fontWeight: '700', color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="section-stack" style={{ marginTop: '2rem' }}>
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <ExamItem 
              key={exam.id} 
              exam={exam} 
              onEnter={(id) => navigate(`/student/exam/${id}`)}
            />
          ))
        ) : (
          <div className="card-clean" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No exams match your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentExams;

