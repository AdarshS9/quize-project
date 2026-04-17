import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Search, Crown, Star, ChevronRight, User as UserIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

const LeaderRow = ({ entry, isTop3 }) => (
  <div className="card-clean list-row" style={{ 
    justifyContent: 'space-between', padding: '1.25rem 2rem', marginBottom: '1rem',
    border: isTop3 ? '1px solid var(--primary)' : '1px solid var(--border-color)',
    background: isTop3 ? 'var(--bg-light)' : 'white'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ 
        width: '40px', height: '40px', background: isTop3 ? 'var(--primary-gradient)' : 'var(--surface-light)', 
        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', fontWeight: '800', color: isTop3 ? 'white' : 'var(--primary)',
        boxShadow: isTop3 ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
      }}>
        {isTop3 ? (entry.rank === 1 ? <Crown size={20} /> : <Medal size={20} />) : entry.rank}
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{entry.name}</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{entry.tests_completed} Assessments Completed</p>
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>{entry.total_score}</p>
        <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Points</p>
      </div>
      <ChevronRight size={18} style={{ opacity: 0.2 }} />
    </div>
  </div>
);

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/student/leaderboard`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setLeaders(data);
      } catch (err) {
        addToast('Failed to load leaderboard', 'error');
      }
    };
    fetchLeaders();
  }, []);

  const filteredLeaders = leaders.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
        <div style={{ 
          width: '56px', height: '56px', background: 'var(--primary-gradient)', 
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px -6px rgba(16, 185, 129, 0.4)'
        }}>
          <Trophy size={28} />
        </div>
        <h1>Global Rankings</h1>
        <p>Celebrating the highest academic achievers and top performers across the platform.</p>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} style={{ pointerEvents: 'none' }} />
          <input 
            type="text"
            placeholder="Find a colleague..."
            className="input-clean"
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section className="section-stack">
          {filteredLeaders.length > 0 ? (
            filteredLeaders.map((entry) => (
              <LeaderRow 
                key={entry.rank} 
                entry={entry} 
                isTop3={entry.rank <= 3 && !searchTerm} 
              />
            ))
          ) : (
            <div className="card-clean" style={{ textAlign: 'center', padding: '4rem' }}>
              <Star size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
              <p style={{ color: 'var(--text-muted)' }}>No rankings found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;

