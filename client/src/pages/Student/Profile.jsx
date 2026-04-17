import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Camera, Edit2, Save, X, Settings } from 'lucide-react';
import { useAuth } from '../../App';
import { useToast } from '../../context/ToastContext';

const ProfileCard = ({ label, value, icon: Icon, editing, onChange, type = "text" }) => (
  <div style={{ padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ width: '40px', height: '40px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
      <Icon size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {editing ? (
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-clean"
          style={{ padding: '0.25rem 0', background: 'transparent', borderBottom: '2px solid var(--primary)', borderRadius: 0 }}
        />
      ) : (
        <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{value}</p>
      )}
    </div>
  </div>
);

const StudentProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    setEditing(false);
    addToast('Profile changes saved', 'success');
  };

  return (
    <div className="app-container animate-fade">
      <header className="section-stack" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 2rem' }}>
          <div style={{ 
            width: '100%', height: '100%', background: 'var(--primary-gradient)', 
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '2.5rem', fontWeight: '800',
            boxShadow: '0 12px 32px -8px rgba(16, 185, 129, 0.4)',
            border: '4px solid white'
          }}>
            {user?.name?.[0]}
          </div>
          <button style={{ 
            position: 'absolute', bottom: '-8px', right: '-8px', width: '32px', height: '32px',
            background: 'white', border: '1px solid var(--border-color)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Camera size={16} />
          </button>
        </div>
        <h1>Personal Identity</h1>
        <p>Maintain your academic profile and notification preferences.</p>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <section className="card-clean section-stack">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Settings size={18} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Account Details</h3>
            </div>
            <button 
              onClick={() => editing ? handleUpdate({ preventDefault: () => {} }) : setEditing(true)}
              className="btn-secondary" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', color: editing ? 'var(--primary)' : 'inherit' }}
            >
              {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ProfileCard 
              label="Full Display Name" 
              value={formData.name} 
              icon={UserIcon} 
              editing={editing}
              onChange={val => setFormData({...formData, name: val})}
            />
            <ProfileCard 
              label="Contact Email" 
              value={formData.email} 
              icon={Mail} 
              editing={editing}
              onChange={val => setFormData({...formData, email: val})}
            />
            <ProfileCard 
              label="Account Hierarchy" 
              value={user?.role || 'Student'} 
              icon={Shield} 
              editing={false}
            />
          </div>
        </section>

        <section className="card-clean" style={{ marginTop: '2rem', background: '#FEF2F2', borderColor: '#FEE2E2', borderStyle: 'dashed' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#B91C1C', marginBottom: '0.5rem' }}>Danger Zone</h3>
          <p style={{ fontSize: '0.8rem', color: '#7F1D1D', opacity: 0.7, marginBottom: '1.5rem' }}>Once you delete your account, all examination history and progress will be permanently wiped.</p>
          <button style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
            Request Account Deletion
          </button>
        </section>
      </div>
    </div>
  );
};

export default StudentProfile;
