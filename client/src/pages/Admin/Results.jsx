import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

const ReportCard = ({ result, onReport }) => {
  const passed = result.score >= result.passing_score;
  
  return (
    <div className="card-clean list-row" style={{ justifyContent: 'space-between', padding: '1.5rem 2rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          width: '48px', height: '48px', background: 'var(--bg-light)', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: passed ? 'var(--primary)' : '#EF4444'
        }}>
          {passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{result.name}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Attempted: {result.exam_title} • {new Date(result.submit_time).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: passed ? 'var(--primary)' : '#EF4444', margin: 0 }}>{result.score}</p>
          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Points Scored</p>
        </div>
        <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => onReport(result.id)}>
          Report <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/attempts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setResults(data);
      } catch (err) {
        addToast('Failed to load reports', 'error');
      }
    };
    fetchResults();
  }, []);

  const filteredResults = results.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = results.length > 0 ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1) : 0;
  const passRate = results.length > 0 ? ((results.filter(r => r.score >= r.passing_score).length / results.length) * 100).toFixed(1) : 0;

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Performance Insights</h1>
          <p>Global analytics and individual candidate transcripts.</p>
        </div>
        <button className="btn-secondary" onClick={() => addToast('Exporting data...', 'info')}>
          <Download size={18} /> Export Results
        </button>
      </header>

      <section className="section-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
        <div className="card-clean" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Avg. Score</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{avgScore}%</h2>
          </div>
        </div>
        <div className="card-clean" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pass Rate</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{passRate}%</h2>
          </div>
        </div>
        <div className="card-clean" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Submissions</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{results.length}</h2>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} style={{ pointerEvents: 'none' }} />
          <input 
            type="text"
            placeholder="Search candidate or exam..."
            className="input-clean"
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section className="section-stack">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <ReportCard 
                key={result.id} 
                result={result} 
                onReport={(id) => navigate(`/admin/reports/${id}`)}
              />
            ))
          ) : (
            <div className="card-clean" style={{ textAlign: 'center', padding: '4rem' }}>
              <FileText size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
              <p style={{ color: 'var(--text-muted)' }}>No submission records available.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminResults;

