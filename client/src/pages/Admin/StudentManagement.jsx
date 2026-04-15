import React, { useEffect, useState } from 'react';
import { Search, UserPlus, FileDown, RotateCw, CheckCircle, XCircle, Share2, RefreshCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    addToast('Student registration link copied!', 'success');
  };

  const handleResetData = async () => {
    if (!window.confirm('WARNING: This will delete ALL exams, questions, results, and students. Continue?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/admin/reset-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        addToast('All data has been wiped.', 'success');
        fetchStudents();
      }
    } catch (err) {
      addToast('Reset failed', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch (err) {
      addToast('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Name', 'Email'];
    const csvContent = [
      headers.join(','),
      ...students.map(s => [s.name, s.email].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_list.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Students list exported!', 'success');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-black tracking-tight text-text-dark">Candidate Console</h1>
          <p className="text-text-muted mt-2">Manage student access, monitor performance, and grant retakes.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleResetData} className="btn bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white flex items-center gap-2">
            <RefreshCcw size={18} /> Wipe All
          </button>
          <button onClick={handleCopyInvite} className="btn-neumorph flex items-center gap-2">
            <Share2 size={18} /> Invite Link
          </button>
          <button onClick={handleExportCSV} className="btn-neumorph flex items-center gap-2">
            <FileDown size={18} /> Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <UserPlus size={18} /> Batch Register
          </button>
        </div>
      </header>

      <div className="glass-card p-6">
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email address..."
            className="w-full py-5 pl-16 pr-8 bg-sky-50/50 border-sky-100/50 focus:bg-white text-lg font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-sky-50/50 text-text-muted uppercase text-[10px] font-black tracking-widest">
                <th className="px-8 py-5">Profile</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Verified</th>
                <th className="px-8 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-sky-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-white flex items-center justify-center font-black text-xl shadow-lg shadow-sky-100">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-text-dark text-lg">{student.name}</p>
                        <p className="text-sm text-text-muted">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="badge badge-completed flex w-fit items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active Student
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <CheckCircle size={20} className="text-green-500" />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 hover:bg-white rounded-xl text-primary transition-all border border-transparent hover:border-sky-100 hover:shadow-sm">
                      <RotateCw size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <XCircle size={48} className="text-text-muted mb-4" />
                      <p className="text-lg font-bold text-text-dark">No Candidates Found</p>
                      <p className="text-sm text-text-muted">Try adjusting your search filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
