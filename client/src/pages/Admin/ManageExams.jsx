import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Globe, Lock, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL exams? This action cannot be undone.')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/admin/exams/all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setExams([]);
        addToast('All exams have been deleted.', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to delete exams.', 'error');
    }
  };

  const handleCopyLink = (examId) => {
    const link = `${window.location.origin}/student/exam/${examId}`;
    navigator.clipboard.writeText(link);
    addToast('Exam link copied to clipboard!', 'success');
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/exams/published`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setExams(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-text-muted mt-2">Create, edit, and publish your examination papers.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleDeleteAll} className="btn bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white">
            <Trash2 size={20} /> Delete All
          </button>
          <button onClick={() => navigate('/admin/exams/create')} className="btn btn-primary">
            <Plus size={20} /> Create New Exam
          </button>
        </div>
      </header>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-glass text-text-muted uppercase text-xs font-bold tracking-wider">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Questions</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-glass/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{exam.title}</p>
                  <p className="text-xs text-text-muted">ID: {exam.id.slice(0, 8)}...</p>
                </td>
                <td className="px-6 py-4 text-text-muted font-mono">{exam.duration}m</td>
                <td className="px-6 py-4">
                   <span className="badge badge-success bg-primary/10 text-primary border-primary/20">{exam.question_count} Items</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {exam.published ? (
                      <><Globe size={14} className="text-emerald-500" /> <span className="text-sm">Published</span></>
                    ) : (
                      <><Lock size={14} className="text-warning" /> <span className="text-sm">Draft</span></>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleCopyLink(exam.id)}
                      className="p-2 hover:bg-glass rounded-lg text-emerald-500 transition-colors"
                      title="Copy Exam Link"
                    >
                      <LinkIcon size={18} />
                    </button>
                    <button className="p-2 hover:bg-glass rounded-lg text-primary transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 hover:bg-glass rounded-lg text-accent transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center text-text-muted italic">
                  No exams found. Click "Create New Exam" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageExams;
