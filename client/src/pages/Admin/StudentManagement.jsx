import React, { useEffect, useState } from 'react';
import { Search, UserPlus, FileDown, RotateCw, CheckCircle, RefreshCcw, Link as LinkIcon, User as UserIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

const StudentRow = ({ student, onAction }) => (
  <div className="card-clean list-row" style={{ justifyContent: 'space-between', padding: '1.25rem 2rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ 
        width: '48px', height: '48px', background: 'var(--surface-light)', 
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', fontWeight: '800', color: 'var(--primary)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {student.name.charAt(0)}
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{student.name}</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</p>
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
        <CheckCircle size={14} />
        Verified
      </div>
      <button 
        onClick={() => onAction(student.id)}
        className="btn-secondary" 
        style={{ padding: '0.5rem', borderRadius: '8px' }}
        title="Sync Student Data"
      >
        <RotateCw size={18} />
      </button>
    </div>
  </div>
);

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    addToast('Invite link copied!', 'success');
  };

  const handleResetData = async () => {
    if (!window.confirm('Wipe ALL system data? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/reset-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        addToast('System reset successful', 'success');
        setStudents([]);
      }
    } catch (err) {
      addToast('Reset failed', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch (err) {
      addToast('Fetch failed', 'error');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExportCSV = () => {
    const csvContent = "Name,Email\n" + students.map(s => `${s.name},${s.email}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "students.csv";
    link.click();
    addToast('CSV Exported', 'success');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Candidate Console</h1>
          <p>Monitor and manage student engagement.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleResetData} className="btn-secondary" style={{ color: '#DC2626' }}>
            <RefreshCcw size={18} /> Wipe System
          </button>
          <button onClick={handleCopyInvite} className="btn-secondary">
            <LinkIcon size={18} /> Invite Link
          </button>
          <button onClick={handleExportCSV} className="btn-secondary">
            <FileDown size={18} /> Export
          </button>
        </div>
      </header>

      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} style={{ pointerEvents: 'none' }} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="input-clean"
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section className="section-stack">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentRow 
                key={student.id} 
                student={student} 
                onAction={(id) => addToast('Feature in development', 'info')}
              />
            ))
          ) : (
            <div className="card-clean" style={{ textAlign: 'center', padding: '4rem' }}>
              <UserIcon size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
              <p style={{ color: 'var(--text-muted)' }}>No students registered yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentManagement;

