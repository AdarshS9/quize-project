import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../../App';
import { API_URL } from '../../config';

const StatInline = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '2rem' }}>
    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
      <Icon size={20} />
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</p>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalExams: 0, totalStudents: 0, totalSubmissions: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="app-container animate-fade">
      <header className="section-stack">
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {user?.name}</h1>
          <p>Here's what's happening on your platform today.</p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          background: 'var(--surface-light)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius)', 
          border: '1px solid var(--border-color)' 
        }}>
          <StatInline icon={FileText} label="Active Exams" value={stats.totalExams || 0} />
          <StatInline icon={Users} label="Total Students" value={stats.totalStudents || 0} />
          <StatInline icon={CheckCircle} label="Completed" value={stats.totalSubmissions || 0} />
          <StatInline icon={TrendingUp} label="Avg Score" value="84%" />
        </div>
      </header>

      <section className="section-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Platform Analytics</h2>
          <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Last 30 Days</button>
        </div>
        
        <div className="card-clean" style={{ minHeight: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', padding: '3rem 2rem' }}>
          {[45, 65, 40, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '100%', 
                height: `${h * 2}px`, 
                background: 'var(--primary-gradient)', 
                borderRadius: '8px', 
                opacity: 0.2 + (h/100),
                transition: 'var(--transition)'
              }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>M {i+1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Recent Activity</h2>
          <button style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>View All</button>
        </div>

        <div className="card-clean" style={{ padding: '0' }}>
          {[
            { user: 'Sarah Jenkins', action: 'completed Final Physics Exam', time: '2m ago', score: '92%' },
            { user: 'Michael Chen', action: 'started Biology Quiz', time: '15m ago', score: '-' },
            { user: 'System', action: 'published "Calculus III Advanced"', time: '1h ago', score: '-' },
            { user: 'Emily Davis', action: 'requested password reset', time: '3h ago', score: '-' },
          ].map((item, idx) => (
            <div key={idx} className="list-row" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.user}</p>
                  <p style={{ fontSize: '0.85rem' }}>{item.action}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.score !== '-' ? item.score : ''}</p>
                <p style={{ fontSize: '0.75rem' }}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <button className="btn-emerald" style={{ padding: '1rem 3rem' }}>
          Create New Exam <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
