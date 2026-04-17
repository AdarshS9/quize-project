import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Globe, Lock, Link as LinkIcon, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';

const ExamRow = ({ exam, onCopy, onEdit, onDelete }) => (
  <div className="card-clean list-row" style={{ justifyContent: 'space-between', padding: '1.5rem 2rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ 
        width: '48px', height: '48px', background: 'var(--bg-light)', 
        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: exam.status === 'published' ? 'var(--primary)' : 'var(--text-muted)'
      }}>
        {exam.status === 'published' ? <Globe size={24} /> : <Lock size={24} />}
      </div>
      <div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{exam.title}</h3>
          <span className="badge" style={{ 
            fontSize: '0.6rem', 
            background: exam.status === 'published' ? 'var(--bg-light)' : '#F3F4F6', 
            color: exam.status === 'published' ? 'var(--primary)' : '#6B7280' 
          }}>
            {exam.status}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {exam.subject || 'General'} • {exam.duration}m • {new Date(exam.date).toLocaleDateString()} • {exam.question_count} Questions
        </p>
      </div>
    </div>
    
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button 
        onClick={() => onCopy(exam.id)}
        className="btn-secondary" 
        style={{ padding: '0.5rem', borderRadius: '8px' }}
        title="Copy Exam Link"
      >
        <LinkIcon size={18} />
      </button>
      <button 
        onClick={() => onEdit(exam.id)}
        className="btn-secondary" 
        style={{ padding: '0.5rem', borderRadius: '8px' }}
        title="Edit Exam"
      >
        <Edit size={18} />
      </button>
      <button 
        onClick={() => onDelete(exam.id)}
        className="btn-secondary" 
        style={{ padding: '0.5rem', borderRadius: '8px', color: '#DC2626' }}
        title="Delete Exam"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleCopyLink = (examId) => {
    const link = `${window.location.origin}/student/exam/${examId}`;
    navigator.clipboard.writeText(link);
    addToast('Exam link copied!', 'success');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await apiFetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setExams(exams.filter(e => e.id !== id));
      addToast('Exam deleted', 'success');
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

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

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Exam Registry</h1>
          <p>Configure and distribute your assessments.</p>
        </div>
        <button className="btn-emerald" onClick={() => navigate('/admin/exams/create')}>
          <Plus size={20} /> Create New
        </button>
      </header>

      <section className="section-stack" style={{ marginTop: '2rem' }}>
        {exams.length > 0 ? (
          exams.map((exam) => (
            <ExamRow 
              key={exam.id} 
              exam={exam} 
              onCopy={handleCopyLink}
              onEdit={(id) => navigate(`/admin/exams/edit/${id}`)}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="card-clean" style={{ textAlign: 'center', padding: '4rem' }}>
            <FileText size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
            <p style={{ color: 'var(--text-muted)' }}>No exams found. Start by creating one.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageExams;

